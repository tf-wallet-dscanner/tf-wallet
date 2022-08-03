import Web3 from 'web3';

class EthQuery {
  #network = new WeakMap();

  #provider = new WeakMap();

  constructor(network) {
    this.#network.set(this, network);
    this.#provider.set(
      this,
      new Web3(new Web3.providers.HttpProvider(network)),
    );
  }

  /**
   * @see https://web3js.readthedocs.io/en/v1.7.4/web3-eth.html?highlight=getBalance#getbalance
   * @param {string} address The address to get the balance of.
   * @returns {Promise<string>} The current balance for the given address in wei.
   */
  async getBalance(address) {
    try {
      const balance = await this.#provider.get(this).eth.getBalance(address);
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
      const block = await this.#provider
        .get(this)
        .eth.getBlock(blockNumber, false);
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
      const latestBlock = await this.#provider
        .get(this)
        .eth.getBlock('latest', false);
      return latestBlock;
    } catch (e) {
      console.error('EthQuery - getLatestBlock Error - ', e);
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
  async getNetworkVersion() {
    try {
      const networkVersion = await this.#fetchJsonRpc(
        this.#network.get(this),
        'net_version',
      );
      return networkVersion;
    } catch (e) {
      console.error('EthQuery - getNetworkVersion Error - ', e);
    }
  }

  async #fetchJsonRpc(network, method, params) {
    try {
      const response = await fetch(network, {
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
