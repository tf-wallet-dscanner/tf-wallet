// import EthQuery from 'ethjs-query';
import abiERC20 from '../contracts/ERC20.json';

// import abiERC721 from '../contracts/ERC721.json';

class TokenController {
  #store; // extension store object

  /**
   * @info #tokenStore 데이터 구조
   *
   * store: {
   *   tokens: {
   *     "<address_1>": [...ca]
   *     "<address_2>": [...ca]
   *     ...
   *   }
   * }
   */
  #tokenStore; // keyrings eoa들의 모든 token list

  constructor(opts = {}) {
    this.#store = opts.store;
    this.getProvider = opts.getProvider;
    this.#tokenStore = this.#store.tokens;
    this.tokens = []; // state에서 사용할 eoa 별 token list
  }

  /**
   * @returns {Promise<any>}
   */
  get getStoreAll() {
    return this.#store.getAll();
  }

  /**
   * @returns {Promise<any>}
   */
  async getTokenStore() {
    const res = await this.#store.get('tokens');
    return res;
  }

  /**
   * set Token List
   * @param {Object} tokenConfig
   */
  async #setTokenList(config) {
    await this.#store.set({
      ...config,
    });
  }

  getTokens() {
    /**
     * @TODO tokenStore 내에서 store.accounts.selectAddress 와 매칭된 주소의 token 저장
     */
    // return this.tokens;
    return this.getTokenStore();
  }

  /**
   * For each token in the tokenlist provided by the TokenListController, check selectedAddress balance.
   */
  async detectNewTokens() {
    const { keyringTokens } = this.#tokenStore;
  }

  /**
   * Adds a token to the stored token list.
   *
   * @param address - Hex address of the token contract.
   * @param symbol - Symbol of the token.
   * @param decimals - Number of decimals the token uses.
   * @param image - Image of the token.
   * @returns Current token list.
   */
  async addToken(address, symbol, decimals, image) {
    const { accounts } = await this.getStoreAll;
    this.#tokenStore = await this.getTokenStore();
    console.log('this.#tokenStore', this.#tokenStore);

    if (!accounts) {
      throw new Error('accounts store data not exist.');
    }

    const newEntry = { address, symbol, decimals, image };

    const previousEntry = this.tokens.find(
      (token) => token.address.toLowerCase() === address.toLowerCase(),
    );
    console.log('previousEntry', previousEntry);
    if (previousEntry) {
      const previousIndex = this.tokens.indexOf(previousEntry);
      this.tokens[previousIndex] = newEntry;
    } else {
      this.tokens.push(newEntry);
      this.#setTokenList({
        tokens: {
          [`${accounts.selectedAddress}`]: this.tokens,
        },
      });

      console.log('tokens', await this.getTokens());
    }
    return newEntry;
  }

  /**
   *
   *
   * @param tokens
   */
  async _getTokenBalances(tokens) {
    const ethContract = this.web3.eth.contract(abiERC20.abi);
    return new Promise((resolve, reject) => {
      ethContract.balances([this.selectedAddress], tokens, (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      });
    });
  }

  /**
   * Remove a token from the stored token list.
   *
   * @param address - The hex address of the token contract.
   */
  async removeToken(address) {
    console.log('removeToken', address);
  }

  /**
   * Removes all tokens from the ignored list.
   */
  clearIgnoredTokens() {
    this.update({ ignoredTokens: [], allIgnoredTokens: {} });
  }
}

export default TokenController;
