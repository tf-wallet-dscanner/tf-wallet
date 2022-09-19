import abi from 'ethereumjs-abi';

import { isAddress, weiHexToEthDec } from '../lib/util';

// import abiERC20 from '../contracts/ERC20.json';
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
    this.ethQuery = opts.ethQuery;
    this.sendRawTransaction = opts.sendRawTransaction;
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

  /**
   * tokenStore 내에서 store.accounts.selectAddress 와 매칭된 주소의 token 저장
   */
  async getTokens() {
    const { accounts } = await this.getStoreAccounts();
    if (this.tokens.length > 0) {
      this.tokens.forEach(async (token, index) => {
        const balance = await this.#getTokenBalances(
          accounts.selectedAddress,
          token.address,
        );
        Object.assign(this.tokens[index], { ...this.tokens[index], balance });
      });
    }
    return this.tokens;
  }

  /**
   * For each token in the tokenlist provided by the TokenListController, check selectedAddress balance.
   * @TODO 이더 or 클레이튼 explorer DB에 유저 EOA를 조회하여 Token 리스트를 받아오기
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

    if (previousEntry) {
      // 기존 tokens에 존재하면 token 정보 수정
      const previousIndex = this.tokens.indexOf(previousEntry);
      this.tokens[previousIndex] = newEntry;
      await tokens[accounts.selectedAddress].splice(previousIndex, 1, newEntry);
    } else {
      // 신규 토큰 저장
      this.tokens.push(newEntry);
      await tokens[accounts.selectedAddress].push(newEntry);
    }
    await this.#setTokenList({ tokens });
    return newEntry;
  }

  /**
   *
   * @param {*} token
   * @returns
   */
  async ERC20Transfer(token) {
    // this.sendRawTransaction(txMeta);
    console.log('ERC20Transfer');
    return null;
  }

  /**
   * @TODO ethererumjs-abi를 통한 rawHexData 생성 함수 작성 필요
   */
  encodeCall(name, args, values) {
    const methodId = abi.methodID(name, args).toString('hex');
    const params = abi.rawEncode(args, values).toString('hex');
    return `0x${methodId}${params}`;
  }

  /**
   * @TODO rawHexData 리팩토링 필요
   *
   * @param address EOA
   * @param tokenCa ERC20 contract address
   */
  async #getTokenBalances(address, tokenCa) {
    if (!isAddress(tokenCa)) return 0;
    const sha3BalanceOf = '70a08231';
    const holder = address.slice(2);
    const rawHexData = `0x${sha3BalanceOf}000000000000000000000000${holder}`;

    const params = {
      to: tokenCa,
      data: rawHexData,
    };

    const amount = await this.ethQuery('eth_call', params, 'latest');
    return weiHexToEthDec(amount);
  }

  /**
   * Remove a token from the stored token list.
   * @TODO storeToken에 등록된 token 정보 삭제
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
