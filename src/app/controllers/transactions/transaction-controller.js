import Common from '@ethereumjs/common';
import { Transaction } from '@ethereumjs/tx';
import {
  CHAIN_ID_TO_NETWORK_ID_MAP,
  HARDFORKS,
  INFURA_PROVIDER_TYPES,
} from 'app/constants/network';
import { addHexPrefix } from 'ethereumjs-util';
import EthQuery from 'ethjs-query';
import EventEmitter from 'events';

import TxGasUtil from './tx-gas-utils';

class TransactionController extends EventEmitter {
  #txStore;

  constructor(opts = {}) {
    super();

    this.#txStore = opts.store;
    this.unlockKeyrings = opts.unlockKeyrings;
    this.signEthTx = opts.signTransaction;
    this.getProvider = opts.getProvider;
    this.getEIP1559Compatibility = opts.getEIP1559Compatibility;
  }

  // approveTransaction 형태로 수정하면 sendRawTransaction을 refactor 필요함
  // async approveTransaction(txId) {
  //   // nonceLock
  //   // approve
  //   // get next nonce
  //   // wait for a nonce
  //   // add nonce to txParams
  //   // sign transaction
  //   // publish transaction
  //   // release lock
  // }

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

      const provider = this.getProvider();
      const ethQuery = new EthQuery(provider);

      const txnCount = await ethQuery.getTransactionCount(
        accounts.selectedAddress,
        'latest',
      );

      const common = await this.getCommonConfiguration();
      const txGasUtil = new TxGasUtil(provider);

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
        nonce: addHexPrefix(txnCount.toString(16)),
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
      const rawTxHex = `0x${serializedEthTx.toString('hex')}`;

      const txResult = await ethQuery.sendRawTransaction(rawTxHex);
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
}

export default TransactionController;
