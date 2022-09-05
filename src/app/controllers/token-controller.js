// import EthQuery from 'ethjs-query';
import abiERC20 from '../contracts/ERC20.json';

// import abiERC721 from '../contracts/ERC721.json';

class TokenController {
  #tokenStore; // keyrings eoa들의 모든 token list

  #tokens; // state에서 사용할 eoa 별 token list

  constructor(opts = {}) {
    this.#tokenStore = opts.store.tokens;
    this.getProvider = opts.getProvider;
  }

  /**
   * set Token List
   * @param {Object} tokenConfig
   */
  async #setTokenList(config) {
    await this.#tokenStore.set({
      ...config,
    });
  }

  getTokens() {
    return this.#tokens;
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
    const newEntry = { address, symbol, decimals, image };
    const previousEntry = this.tokens.find(
      (token) => token.address.toLowerCase() === address.toLowerCase(),
    );
    if (previousEntry) {
      const previousIndex = this.tokens.indexOf(previousEntry);
      this.tokens[previousIndex] = newEntry;
    } else {
      this.tokens.push(newEntry);
      this.#setTokenList({
        tokens: {
          [`${this.selectedAddress}`]: {
            ...newEntry,
          },
        },
      });
    }
    return this.tokens;
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
