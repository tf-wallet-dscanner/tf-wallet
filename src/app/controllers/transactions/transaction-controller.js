import Common from '@ethereumjs/common';
import { Transaction } from '@ethereumjs/tx';
import {
  CHAIN_ID_TO_NETWORK_ID_MAP,
  HARDFORKS,
  NETWORK_TYPE_RPC,
} from 'app/constants/network';
import EthQuery from 'ethjs-query';
import EventEmitter from 'events';

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
    if (network !== NETWORK_TYPE_RPC) {
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

  // sendTransaction
  async sendRawTransaction(password, to, decimalValue) {
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

    const txParams = {
      nonce: txnCount,
      gasPrice: '0x9184e72a000',
      gasLimit: '0x5208',
      to,
      value: `0x${parseInt(decimalValue, 10).toString(16)}`,
    };

    // sign tx
    const unsignedEthTx = Transaction.fromTxData(txParams, { common });
    const signedEthTx = await this.signEthTx(
      unsignedEthTx,
      accounts.selectedAddress,
    );
    // const signedTx = tx.sign(Buffer.from(privKey, 'hex'));
    const serializedEthTx = signedEthTx.serialize();
    const rawTxHex = `0x${serializedEthTx.toString('hex')}`;

    const txResult = await ethQuery.sendRawTransaction(rawTxHex);
    console.log('txResult: ', txResult);
    return txResult;
  }

  /**
   * @returns {Promise<any>}
   */
  get txConfig() {
    return this.#txStore.getAll();
  }
}

export default TransactionController;
