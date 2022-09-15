import { SECOND } from 'app/constants/time';
import getFetchWithTimeout from 'app/modules/fetch-with-timeout';
import Web3 from 'web3';
import Accounts from 'web3-eth-accounts';

class Web3Query {
  #rpcUrl;

  #web3Provider;

  constructor(rpcUrl) {
    this.#rpcUrl = rpcUrl;
    this.#web3Provider = new Web3(new Web3.providers.HttpProvider(rpcUrl));
  }

  /**
   * @see https://web3js.readthedocs.io/en/v1.7.4/web3-eth.html?highlight=getBalance#getbalance
   * @param {string} address The address to get the balance of.
   * @returns {Promise<string>} The current balance for the given address in wei.
   */
  async getBalance(address) {
    try {
      const balance = await this.#web3Provider.eth.getBalance(address);
      return balance;
    } catch (e) {
      console.error('Web3Query - getBalance Error - ', e);
    }
  }

  /**
   * @see https://web3js.readthedocs.io/en/v1.7.4/web3-eth.html?highlight=getBalance#getblock
   * @param {String|Number|BN|BigNumber} blockNumber: The block number or block hash. Or the string "earliest", "latest" or "pending"
   * @returns {Promise<Block>} The block object:
   */
  async getBlockByNumber(blockNumber) {
    try {
      const block = await this.#web3Provider.eth.getBlock(blockNumber, false);
      return block;
    } catch (e) {
      console.error('Web3Query - getBlockByNumber Error - ', e);
    }
  }

  /**
   * @see https://web3js.readthedocs.io/en/v1.7.4/web3-eth.html?highlight=getBalance#getblock
   * @returns {Promise<Block>} The block object:
   */
  async getLatestBlock() {
    try {
      const latestBlock = await this.#web3Provider.eth.getBlock(
        'latest',
        false,
      );
      return latestBlock;
    } catch (e) {
      console.error('Web3Query - getLatestBlock Error - ', e);
    }
  }

  /**
   * @see https://web3js.readthedocs.io/en/v1.7.4/web3-eth.html?highlight=getBalance#getblocknumber
   * @returns {Promise<number>} The number of the most recent block.
   */
  async getBlockNumber() {
    try {
      const blockNumber = await this.#web3Provider.eth.getBlockNumber();
      return blockNumber;
    } catch (e) {
      console.error('Web3Query - getBlockNumber Error - ', e);
    }
  }

  /**
   * @see https://ethereum.org/ko/developers/docs/apis/json-rpc/#net_version
   * @returns String - The current network id
   * @example response {
   *   "id":67,
   *   "jsonrpc": "2.0",
   *   "result": "3"
   * }
   */
  async getNetworkId() {
    try {
      const networkId = await this.#fetchJsonRpc(this.#rpcUrl, 'net_version');
      return networkId;
    } catch (e) {
      console.error('Web3Query - getNetworkId Error - ', e);
    }
  }

  async #fetchJsonRpc(rpcUrl, method, params) {
    try {
      const fetchWithTimeout = getFetchWithTimeout(SECOND * 30);
      const response = await fetchWithTimeout(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method,
          params: params ?? [],
          id: 1,
        }),
      });

      if (response.ok) {
        const jsonRpcData = await response.json();
        return jsonRpcData;
      }

      return response;
    } catch (e) {
      console.error('Web3Query - fetchJsonRpc Error - ', e);
    }
  }

  /**
   * @see https://web3js.readthedocs.io/en/v1.7.5/web3-eth-accounts.html#encrypt
   * @param {String} privateKey - The private key to encrypt.
   * @param {String} password - The password used for encryption.
   * @returns {Object} The encrypted keystore v3 JSON
   */
  getAccountsEncrypt({ privateKey, password }) {
    try {
      const acct = new Accounts();

      const keystoreV3 = acct.encrypt(privateKey, password);
      return keystoreV3;
    } catch (e) {
      console.error('Web3Query - web3.eth.accounts.encrypt Error - ', e);
    }
  }

  /**
   * @see https://web3js.readthedocs.io/en/v1.7.4/web3-eth-contract.html
   * @param {string} abi The json interface for the contract to instantiate.
   * @param {string} address The address of the smart contract to call.
   * @returns {Promise<string>} The current balance for the given address in wei.
   */
  async contract(abi, address) {
    try {
      // const ethContract = new this.#web3Provider.eth.Contract(abi, address);
      console.log('this.#web3Provider', this.#web3Provider, this.#rpcUrl);
      const ethContract = new this.#web3Provider.eth.Contract(abi, address);
      return ethContract;
    } catch (e) {
      console.error('Web3Query - contract Error - ', e);
    }
  }
}

export default Web3Query;
