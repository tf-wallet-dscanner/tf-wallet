import Web3Query from 'app/lib/web3-query';

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
   *     "<address_1>": [ca array]
   *     "<address_2>": [ca array]
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
  }

  /**
   * 어플리케이션 실행 시 실행되는 함수, #tokenStore.tokens 세팅
   */
  async initializeTokens() {
    const storeAll = await this.getStoreAll();
    const { accounts } = await this.#accountStore;
    if (!accounts) {
      throw new Error('accounts store data not exist.');
    }
    // 처음 한번만 호출
    if (!storeAll.tokens) {
      const newAddress = {
        tokens: {
          [`${accounts.selectedAddress}`]: this.tokens,
        },
      };
      await this.#setTokenList(newAddress);
    }
    console.log(
      'initializeTokens result',
      await this.getTokenStore(),
      this.tokens,
    );
  }

  /**
   * switch accounts 시 해당 address의 tokens 정보 체크 없으면 빈 값 저장
   */
  async switchAccounts() {
    this.#accountStore = await this.getStoreAccounts();
    const { accounts } = this.#accountStore;
    // store에서 본인 eoa에 맞는 token get
    const { tokens } = await this.#tokenStore;
    const selectedAddressToken = tokens[`${accounts.selectedAddress}`];

    if (!selectedAddressToken) {
      const newAddress = {
        [`${accounts.selectedAddress}`]: [],
      };
      Object.assign(tokens, newAddress);
      await this.#setTokenList({ tokens });
    }
    this.tokens = selectedAddressToken || [];
    return accounts.selectedAddress;
  }

  async getTokens() {
    /**
     * @TODO tokenStore 내에서 store.accounts.selectAddress 와 매칭된 주소의 token 저장
     */
    const { accounts } = this.#accountStore;

    this.tokens.forEach((token) => {
      const balance = this.#getTokenBalances(
        accounts.selectedAddress,
        token.address,
      );
      console.log('balance', balance, token);
    });
    console.log('getTokens', this.tokens);
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
    if (!accounts) {
      throw new Error('accounts store data not exist.');
    }
    const { tokens } = await this.getTokenStore();

    const newEntry = { address, symbol, decimals, image };

    const previousEntry = this.tokens.find(
      (token) => token.address.toLowerCase() === address.toLowerCase(),
    );

    console.log(
      'previousEntry',
      previousEntry,
      this.tokens.indexOf(previousEntry),
    );

    if (previousEntry) {
      // 기존 tokens에 존재하면 token 정보 수정
      const previousIndex = this.tokens.indexOf(previousEntry);
      this.tokens[previousIndex] = newEntry;
      tokens[accounts.selectedAddress].splice(previousIndex, 1, newEntry);
      await this.#setTokenList({ tokens });
    } else {
      // 신규 토큰 저장
      this.tokens.push(newEntry);
      await tokens[accounts.selectedAddress].push(newEntry);
      await this.#setTokenList({ tokens });
    }

    console.log('addToken this.tokens', this.tokens);
    console.log('addToken this.#tokenStore', await this.getTokenStore());
    return newEntry;
  }

  /**
   *
   *
   * @param tokenCa
   */
  async #getTokenBalances(address, tokenCa) {
    // const provider = this.getProvider();
    // const ethQuery = new EthQuery(provider);
    // const contract = ethQuery.contract(abiERC20.abi, tokenCa);

    const { rpcUrl } = await this.getStoreAll();
    const web3Query = new Web3Query(rpcUrl);
    const contract = await web3Query.contract(abiERC20.abi, tokenCa);
    console.log('contract', contract);
    contract.methods.balanceOf(address).call((err, res) => {
      if (err) {
        console.log('An error occured', err);
        return;
      }
      console.log('The balance is: ', res);
    });
    // const amount = await ethQuery.balanceOf(address).call();
    // console.log('amount', amount);
    // return new Promise((resolve, reject) => {
    //   contract.balanceOf([this.selectedAddress], tokenCa, (error, result) => {
    //     if (error) {
    //       return reject(error);
    //     }
    //     return resolve(result);
    //   });
    // });
    return null;
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
   * @returns {Promise<any>}
   */
  async getStoreAll() {
    const result = await this.#store.getAll();
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

  /**
   * Removes all tokens from the token list.
   */
  clearTokens() {
    this.update({ tokens: [] });
  }
}

export default TokenController;
