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

  async getBalance(address) {
    try {
      const balance = await this.#provider.get(this).eth.getBalance(address);
      return balance;
    } catch (e) {
      console.error('EthQuery - getBalance Error - ', e);
    }
  }

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
