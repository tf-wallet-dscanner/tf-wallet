import { SECOND } from 'app/constants/time';
import getFetchWithTimeout from 'app/modules/fetch-with-timeout';
import Web3 from 'web3';

class EthQuery {
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
      console.error('EthQuery - getBalance Error - ', e);
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
      console.error('EthQuery - getBlockByNumber Error - ', e);
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
      console.error('EthQuery - getLatestBlock Error - ', e);
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
      console.error('EthQuery - getBlockNumber Error - ', e);
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
      console.error('EthQuery - getNetworkId Error - ', e);
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
      console.error('EthQuery - fetchJsonRpc Error - ', e);
    }
  }
}

export default EthQuery;
