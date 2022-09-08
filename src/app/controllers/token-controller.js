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

  #accountStore;

  constructor(opts = {}) {
    this.#store = opts.store;
    this.getProvider = opts.getProvider;
    this.#tokenStore = this.getTokenStore();
    this.#accountStore = this.getStoreAccounts();
    this.tokens = []; // state에서 사용할 eoa 별 token list
    // this.initializeTokens();
  }

  /**
   * 어플리케이션 실행 시 실행되는 함수, #tokenStore.tokens 세팅
   */
  async initializeTokens() {
    const { accounts } = await this.#accountStore;
    const { tokens } = await this.#tokenStore;

    console.log('tokens', tokens);

    if (tokens) {
      this.tokens = await tokens[`${accounts.selectedAddress}`];
    } else {
      await this.#setTokenList({
        tokens: {
          [`${accounts.selectedAddress}`]: this.tokens,
        },
      });
    }
    console.log('initializeTokens', await this.getTokenStore(), this.tokens);
  }

  /**
   * @returns {Promise<any>}
   */
  async getStoreAccounts() {
    const result = await this.#store.get('accounts');
    return result;
  }

  /**
   * @returns {Promise<any>}
   */
  async getTokenStore() {
    const result = await this.#store.get('tokens');
    return result;
  }

  /**
   * set Token List
   * @param {Object} config
   */
  async #setTokenList(config) {
    await this.#store.set({
      ...config,
    });
  }

  async switchAccounts() {
    /**
     * @TODO switch accounts 시 해당 address의 tokens 정보 체크 없으면 빈 값 저장
     */
    this.#accountStore = await this.getStoreAccounts();
    const { accounts } = this.#accountStore;
    return accounts.selectedAddress;
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
    const { accounts } = await this.getStoreAccounts();
    const { tokens } = await this.getTokenStore();

    console.log('before tokens', tokens);

    if (!accounts) {
      throw new Error('accounts store data not exist.');
    }

    const newEntry = { address, symbol, decimals, image };

    const previousEntry = this.tokens.find(
      (token) => token.address.toLowerCase() === address.toLowerCase(),
    );

    console.log(
      'previousEntry',
      previousEntry,
      this.tokens.indexOf(previousEntry),
    );
    console.log('selectedAddress', accounts.selectedAddress);

    if (previousEntry) {
      // 기존 tokens에 존재하면 token 정보 수정
      const previousIndex = this.tokens.indexOf(previousEntry);
      this.tokens[previousIndex] = newEntry;
      tokens[accounts.selectedAddress].splice(previousIndex, 1, newEntry);
      console.log('true previousEntry', tokens);
      await this.#setTokenList({ tokens });
    } else {
      this.tokens.push(newEntry);

      await tokens[accounts.selectedAddress].push(newEntry);
      await this.#setTokenList({ tokens });
      console.log('setTokenList', tokens);
    }

    console.log('after this.tokens', this.tokens);
    console.log('after this.#tokenStore', await this.getTokenStore());
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
   * Removes all tokens from the token list.
   */
  clearTokens() {
    this.update({ tokens: [] });
  }
}

export default TokenController;
