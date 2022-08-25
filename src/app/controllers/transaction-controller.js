import Common from '@ethereumjs/common';
import { Transaction } from '@ethereumjs/tx';
import {
  CHAIN_ID_TO_NETWORK_ID_MAP,
  INFURA_PROVIDER_TYPES,
} from 'app/constants/network';
import createInfuraClient from 'app/lib/createInfuraClient';
import createJsonRpcClient from 'app/lib/createJsonRpcClient';
import { providerFromEngine } from 'eth-json-rpc-middleware';
import EthQueryLib from 'ethjs-query';
import EventEmitter from 'events';
import { JsonRpcEngine } from 'json-rpc-engine';

class TransactionController extends EventEmitter {
  #txStore;

  #infuraProjectId;

  constructor(opts = {}) {
    super();

    this.#txStore = opts.store;
    this.#setInfuraProjectId = opts.infuraProjectId;
    this.unlockKeyrings = opts.unlockKeyrings;
    this.signEthTx = opts.signTransaction;
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

  // sendTransaction
  async sendRawTransaction(password, to, decimalValue) {
    const { type: network, rpcUrl, chainId, accounts } = await this.txConfig;

    if (!accounts) {
      throw new Error('accounts store data not exist.');
    }

    // keyring restore
    await this.unlockKeyrings(password);

    const networkClient = this.#getMiddlewareClient(network, rpcUrl, chainId);
    const engine = new JsonRpcEngine();
    engine.push(networkClient);

    const provider = providerFromEngine(engine);
    const ethQuery = new EthQueryLib(provider);

    const txnCount = await ethQuery.getTransactionCount(
      accounts.selectedAddress,
      'latest',
    );

    const isInfura = INFURA_PROVIDER_TYPES.includes(network);
    const decimalChainId = CHAIN_ID_TO_NETWORK_ID_MAP[chainId];

    const common = isInfura
      ? new Common({ chain: Number(decimalChainId) })
      : Common.custom({ chainId: decimalChainId });

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

  #getMiddlewareClient(network, rpcUrl, chainId) {
    const projectId = this.#infuraProjectId;
    const isInfura = INFURA_PROVIDER_TYPES.includes(network);

    if (isInfura) {
      const { networkMiddleware } = createInfuraClient({
        network,
        projectId,
      });
      return networkMiddleware;
    }

    const { networkMiddleware } = createJsonRpcClient({
      rpcUrl,
      chainId,
    });
    return networkMiddleware;
  }

  /**
   * @returns {Promise<any>}
   */
  get txConfig() {
    return this.#txStore.getAll();
  }

  /**
   * Sets the Infura project ID
   *
   * @param {string} projectId - The Infura project ID
   * @throws {Error} If the project ID is not a valid string.
   */
  set #setInfuraProjectId(projectId) {
    if (!projectId || typeof projectId !== 'string') {
      throw new Error('Invalid Infura project ID');
    }

    this.#infuraProjectId = projectId;
  }
}

export default TransactionController;
