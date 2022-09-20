import Common from '@ethereumjs/common';
import { Transaction, TransactionFactory } from '@ethereumjs/tx';
import { METAMASK_CONTROLLER_EVENTS } from 'app/constants/app';
import {
  CHAIN_ID_TO_NETWORK_ID_MAP,
  HARDFORKS,
  INFURA_PROVIDER_TYPES,
} from 'app/constants/network';
import {
  TRANSACTION_ENVELOPE_TYPES,
  TRANSACTION_TYPES,
} from 'app/constants/transaction';
import NonceTracker from 'app/lib/nonce-tracker';
import { isEIP1559Transaction } from 'app/modules/transaction.utils';
import { addHexPrefix, bufferToHex, keccak, toBuffer } from 'ethereumjs-util';
import EventEmitter from 'events';

import PendingTransactionTracker from './pending-tx-tracker';
import TxGasUtil from './tx-gas-utils';
import TransactionStateManager from './tx-state-manager';

class TransactionController extends EventEmitter {
  #txStore;

  constructor(opts = {}) {
    super();

    this.#txStore = opts.store;
    this.unlockKeyrings = opts.unlockKeyrings;
    this.signEthTx = opts.signTransaction;
    this.ethQuery = opts.ethQuery;
    this.getEIP1559Compatibility = opts.getEIP1559Compatibility;
    this.getChainId = opts.getCurrentChainId;
    this.inProcessOfSigning = new Set();

    this.txStateManager = new TransactionStateManager({
      initState: opts.initState || {},
      txHistoryLimit: opts.txHistoryLimit,
      getNetworkId: opts.getNetworkId,
      getCurrentChainId: this.getChainId,
    });

    // nonce-tracker
    this.getBlockTracker = opts.getBlockTracker;
    this.memStore = this.txStateManager.store;
    this.nonceTracker = new NonceTracker({
      ethQuery: this.ethQuery.bind(this.ethQuery),
      blockTracker: this.getBlockTracker,
      getPendingTransactions: (...args) => {
        const pendingTransactions = this.txStateManager.getPendingTransactions(
          ...args,
        );
        // SmartTransactionController에 대해 파악이 안되어서 일단 주석처리
        // const externalPendingTransactions = opts.getExternalPendingTransactions(
        //   ...args,
        // );
        // return [...pendingTransactions, ...externalPendingTransactions];
        return [...pendingTransactions];
      },
      getConfirmedTransactions:
        this.txStateManager.getConfirmedTransactions.bind(this.txStateManager),
    });

    this.pendingTxTracker = new PendingTransactionTracker({
      ethQuery: this.ethQuery.bind(this.ethQuery),
      nonceTracker: this.nonceTracker,
      publishTransaction: (rawTx) => this.ethQuery('sendRawTransaction', rawTx),
      getPendingTransactions: () => {
        const pending = this.txStateManager.getPendingTransactions();
        const approved = this.txStateManager.getApprovedTransactions();
        return [...pending, ...approved];
      },
      approveTransaction: this.approveTransaction.bind(this),
      getCompletedTransactions:
        this.txStateManager.getConfirmedTransactions.bind(this.txStateManager),
    });

    this.txStateManager.store.subscribe(() =>
      this.emit(METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE),
    );
    this._setupListeners();

    // request state update to finalize initialization
    this._updatePendingTxsAfterFirstBlock();
  }

  /**
   * `@ethereumjs/tx` uses `@ethereumjs/common` as a configuration tool for
   * specifying which chain, network, hardfork and EIPs to support for
   * a transaction. By referencing this configuration, and analyzing the fields
   * specified in txParams, `@ethereumjs/tx` is able to determine which EIP-2718
   * transaction type to use.
   *
   * @returns {Common} common configuration object
   */
  async getCommonConfiguration() {
    const { type: network, chainId } = await this.txConfig;

    const supportsEIP1559 = await this.getEIP1559Compatibility();
    // This logic below will have to be updated each time a hardfork happens
    // that carries with it a new Transaction type. It is inconsequential for
    // hardforks that do not include new types.
    const hardfork = supportsEIP1559 ? HARDFORKS.LONDON : HARDFORKS.BERLIN;
    // type will be one of our default network names or 'rpc'. the default
    // network names are sufficient configuration, simply pass the name as the
    // chain argument in the constructor.
    const isInfura = INFURA_PROVIDER_TYPES.includes(network);
    if (isInfura) {
      return new Common({
        chain: network,
        hardfork,
      });
    }
    // For 'rpc' we need to use the same basic configuration as mainnet,
    // since we only support EVM compatible chains, and then override the
    // name, chainId and networkId properties. This is done using the
    // `forCustomChain` static method on the Common class.
    const decimalChainId = parseInt(CHAIN_ID_TO_NETWORK_ID_MAP[chainId], 10);
    return Common.custom({ chainId: decimalChainId });
  }

  /**
   * 코인/토큰 보내기
   * @param {object} txMeta
   * @param {string} txMeta.password - 사용자 패스워드
   * @param {string} txMeta.to - 받는 사람
   * @param {number} txMeta.decimalValue - 보내는 코인/토큰 양 (DEC)
   * @param {number} txMeta.gas - MIN_GAS_LIMIT_DEC(21000)
   * @param {number} txMeta.gasPrice - ETH(KLAY) DEC
   * @param {number} txMeta.maxFeePerGas - The maximum fee per gas that the transaction is willing to pay in total
   * @param {number} txMeta.maxPriorityFeePerGas - The maximum fee per gas to give miners to incentivize them to include the transaction (Priority fee)
   * @returns {string} txResult - 트랜잭션 해쉬값(txHash)
   */
  async sendRawTransaction(txMeta) {
    const { password, to, decimalValue, gasPrice } = txMeta;
    try {
      console.log('txMeta: ', txMeta);
      const { accounts } = await this.txConfig;

      if (!accounts) {
        throw new Error('accounts store data not exist.');
      }

      // keyring restore
      await this.unlockKeyrings(password);

      // nonce tracker (nextNonce)
      const nonceLock = await this.nonceTracker.getNonceLock(
        accounts.selectedAddress,
      );
      nonceLock.releaseLock();

      const common = await this.getCommonConfiguration();
      const txGasUtil = new TxGasUtil({
        ethQuery: this.ethQuery.bind(this.ethQuery),
      });

      const { blockGasLimit, estimatedGasHex, simulationFails } =
        await txGasUtil.analyzeGasUsage(txMeta);

      if (simulationFails) {
        console.error('simulationFails: ', simulationFails);
        return simulationFails.reason;
      }

      // add additional gas buffer to our estimation for safety
      const gasLimit = txGasUtil.addGasBuffer(
        addHexPrefix(estimatedGasHex.toString(16)),
        blockGasLimit.toString(16),
      );

      const txParams = {
        nonce: addHexPrefix(nonceLock.nextNonce.toString(16)),
        gasPrice: addHexPrefix(parseInt(gasPrice * 10 ** 18, 10).toString(16)), // eth to wei
        gasLimit: addHexPrefix(gasLimit),
        to,
        value: addHexPrefix(parseInt(decimalValue * 10 ** 18, 10).toString(16)),
      };
      console.log('txParams: ', txParams);

      // sign tx
      const unsignedEthTx = Transaction.fromTxData(txParams, { common });
      const signedEthTx = await this.signEthTx(
        unsignedEthTx,
        accounts.selectedAddress,
      );

      const serializedEthTx = signedEthTx.serialize();
      const rawTxHex = addHexPrefix(serializedEthTx.toString('hex'));

      const txResult = await this.ethQuery('eth_sendRawTransaction', rawTxHex);
      return txResult;
    } catch (e) {
      console.error('sendRawTransaction error: ', e);
      return e.message;
    }
  }

  /**
   * @returns {Promise<any>}
   */
  get txConfig() {
    return this.#txStore.getAll();
  }

  // called once on startup
  async _updatePendingTxsAfterFirstBlock() {
    // wait for first block so we know we're ready
    await this.getBlockTracker().getLatestBlock();
    // get status update for all pending transactions (for the current network)
    await this.pendingTxTracker.updatePendingTxs();
  }

  /**
   * Sets the txHas on the txMeta
   *
   * @param {number} txId - the tx's Id
   * @param {string} txHash - the hash for the txMeta
   */
  setTxHash(txId, txHash) {
    // Add the tx hash to the persisted meta-tx object
    const txMeta = this.txStateManager.getTransaction(txId);
    txMeta.hash = txHash;
    this.txStateManager.updateTransaction(txMeta, 'transactions#setTxHash');
  }

  /**
   * adds the chain id and signs the transaction and set the status to signed
   *
   * @param {number} txId - the tx's Id
   * @returns {string} rawTx
   */
  async signTransaction(txId) {
    const txMeta = this.txStateManager.getTransaction(txId);
    // add network/chain id
    const { getChainId } = this;
    const type = isEIP1559Transaction(txMeta)
      ? TRANSACTION_ENVELOPE_TYPES.FEE_MARKET
      : TRANSACTION_ENVELOPE_TYPES.LEGACY;
    const txParams = {
      ...txMeta.txParams,
      type,
      chainId: getChainId(),
      gasLimit: txMeta.txParams.gas,
    };
    // sign tx
    const fromAddress = txParams.from;
    const common = await this.getCommonConfiguration(txParams.from);
    const unsignedEthTx = TransactionFactory.fromTxData(txParams, { common });
    const signedEthTx = await this.signEthTx(unsignedEthTx, fromAddress);

    // add r,s,v values for provider request purposes see createMetamaskMiddleware
    // and JSON rpc standard for further explanation
    txMeta.r = bufferToHex(signedEthTx.r);
    txMeta.s = bufferToHex(signedEthTx.s);
    txMeta.v = bufferToHex(signedEthTx.v);

    this.txStateManager.updateTransaction(
      txMeta,
      'transactions#signTransaction: add r, s, v values',
    );

    // set state to signed
    this.txStateManager.setTxStatusSigned(txMeta.id);
    const rawTx = bufferToHex(signedEthTx.serialize());
    return rawTx;
  }

  /**
   * publishes the raw tx and sets the txMeta to submitted
   *
   * @param {number} txId - the tx's Id
   * @param {string} rawTx - the hex string of the serialized signed transaction
   * @returns {Promise<void>}
   */
  async publishTransaction(txId, rawTx) {
    const txMeta = this.txStateManager.getTransaction(txId);
    txMeta.rawTx = rawTx;
    if (txMeta.type === TRANSACTION_TYPES.SWAP) {
      const preTxBalance = await this.query.getBalance(txMeta.txParams.from);
      txMeta.preTxBalance = preTxBalance.toString(16);
    }
    this.txStateManager.updateTransaction(
      txMeta,
      'transactions#publishTransaction',
    );
    let txHash;
    try {
      txHash = await this.ethQuery('eth_sendRawTransaction', rawTx);
    } catch (error) {
      if (error.message.toLowerCase().includes('known transaction')) {
        txHash = keccak(toBuffer(addHexPrefix(rawTx), 'hex')).toString('hex');
        txHash = addHexPrefix(txHash);
      } else {
        throw error;
      }
    }
    this.setTxHash(txId, txHash);
    this.txStateManager.setTxStatusSubmitted(txId);
  }

  /**
   * sets the tx status to approved
   * auto fills the nonce
   * signs the transaction
   * publishes the transaction
   * if any of these steps fails the tx status will be set to failed
   *
   * @param {number} txId - the tx's Id
   */
  async approveTransaction(txId) {
    // TODO: Move this safety out of this function.
    // Since this transaction is async,
    // we need to keep track of what is currently being signed,
    // So that we do not increment nonce + resubmit something
    // that is already being incremented & signed.
    if (this.inProcessOfSigning.has(txId)) {
      return;
    }
    this.inProcessOfSigning.add(txId);
    let nonceLock;
    try {
      // approve
      this.txStateManager.setTxStatusApproved(txId);
      // get next nonce
      const txMeta = this.txStateManager.getTransaction(txId);

      const fromAddress = txMeta.txParams.from;
      // wait for a nonce
      let { customNonceValue } = txMeta;
      customNonceValue = Number(customNonceValue);
      nonceLock = await this.nonceTracker.getNonceLock(fromAddress);
      // add nonce to txParams
      // if txMeta has previousGasParams then it is a retry at same nonce with
      // higher gas settings and therefor the nonce should not be recalculated
      const nonce = txMeta.previousGasParams
        ? txMeta.txParams.nonce
        : nonceLock.nextNonce;
      const customOrNonce =
        customNonceValue === 0 ? customNonceValue : customNonceValue || nonce;

      txMeta.txParams.nonce = addHexPrefix(customOrNonce.toString(16));
      // add nonce debugging information to txMeta
      txMeta.nonceDetails = nonceLock.nonceDetails;
      if (customNonceValue) {
        txMeta.nonceDetails.customNonceValue = customNonceValue;
      }
      this.txStateManager.updateTransaction(
        txMeta,
        'transactions#approveTransaction',
      );
      // sign transaction
      const rawTx = await this.signTransaction(txId);
      await this.publishTransaction(txId, rawTx);
      // must set transaction to submitted/failed before releasing lock
      nonceLock.releaseLock();
    } catch (err) {
      // this is try-catch wrapped so that we can guarantee that the nonceLock is released
      try {
        this._failTransaction(txId, err);
      } catch (err2) {
        console.error(err2);
      }
      // must set transaction to submitted/failed before releasing lock
      if (nonceLock) {
        nonceLock.releaseLock();
      }
      // continue with error chain
      throw err;
    } finally {
      this.inProcessOfSigning.delete(txId);
    }
  }

  async _onLatestBlock(blockNumber) {
    try {
      await this.pendingTxTracker.updatePendingTxs();
    } catch (err) {
      console.error(err);
    }
    try {
      await this.pendingTxTracker.resubmitPendingTxs(blockNumber);
    } catch (err) {
      console.error(err);
    }
  }

  _setupBlockTrackerListener() {
    let listenersAreActive = false;
    const latestBlockHandler = this._onLatestBlock.bind(this);
    const { blockTracker, txStateManager } = this;

    function updateSubscription() {
      const pendingTxs = txStateManager.getPendingTransactions();
      if (!listenersAreActive && pendingTxs.length > 0) {
        blockTracker.on('latest', latestBlockHandler);
        listenersAreActive = true;
      } else if (listenersAreActive && !pendingTxs.length) {
        blockTracker.removeListener('latest', latestBlockHandler);
        listenersAreActive = false;
      }
    }

    txStateManager.on('tx:status-update', updateSubscription);
    updateSubscription();
  }

  /**
   * is called in constructor applies the listeners for pendingTxTracker txStateManager
   * and blockTracker
   */
  _setupListeners() {
    this.txStateManager.on(
      'tx:status-update',
      this.emit.bind(this, 'tx:status-update'),
    );
    this._setupBlockTrackerListener();
    this.pendingTxTracker.on('tx:warning', (txMeta) => {
      this.txStateManager.updateTransaction(
        txMeta,
        'transactions/pending-tx-tracker#event: tx:warning',
      );
    });
    this.pendingTxTracker.on('tx:failed', (txId, error) => {
      this._failTransaction(txId, error);
    });
    this.pendingTxTracker.on(
      'tx:confirmed',
      (txId, transactionReceipt, baseFeePerGas, blockTimestamp) =>
        this.confirmTransaction(
          txId,
          transactionReceipt,
          baseFeePerGas,
          blockTimestamp,
        ),
    );
    this.pendingTxTracker.on('tx:dropped', (txId) => {
      this._dropTransaction(txId);
    });
    this.pendingTxTracker.on('tx:block-update', (txMeta, latestBlockNumber) => {
      if (!txMeta.firstRetryBlockNumber) {
        txMeta.firstRetryBlockNumber = latestBlockNumber;
        this.txStateManager.updateTransaction(
          txMeta,
          'transactions/pending-tx-tracker#event: tx:block-update',
        );
      }
    });
    this.pendingTxTracker.on('tx:retry', (txMeta) => {
      if (!('retryCount' in txMeta)) {
        txMeta.retryCount = 0;
      }
      txMeta.retryCount += 1;
      this.txStateManager.updateTransaction(
        txMeta,
        'transactions/pending-tx-tracker#event: tx:retry',
      );
    });
  }

  _failTransaction(txId, error) {
    this.txStateManager.setTxStatusFailed(txId, error);
  }
}

export default TransactionController;
