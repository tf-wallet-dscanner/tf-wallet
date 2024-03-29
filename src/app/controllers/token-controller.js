import abi from 'ethereumjs-abi';
import Web3 from 'web3';

import { isAddress, weiHexToEthDec } from '../lib/util';

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
  #tokenStore; // local store Account 들의 모든 token list

  #accountStore;

  constructor(opts = {}) {
    this.#store = opts.store;
    this.ethQuery = opts.ethQuery;
    this.#tokenStore = this.getTokenStore();
    this.#accountStore = this.getStoreAccounts();
    this.tokens = []; // state에서 사용할 각각의 eoa 별 token list
  }

  /**
   * 어플리케이션 실행 시 실행되는 함수, #tokenStore.tokens 세팅
   */
  async initializeTokens() {
    try {
      const storeAll = await this.getStoreAll();
      if (!storeAll) {
        throw new Error('All store data not exist.');
      }
      const { accounts } = await this.getStoreAccounts();
      if (!accounts) {
        throw new Error('accounts store data not exist.');
      }
      if (!storeAll.tokens) {
        // 초기 1회만 호출
        const newAddress = {
          tokens: {
            [`${accounts.selectedAddress}`]: this.tokens,
          },
        };
        await this.#setTokenList(newAddress);
      } else {
        // 기존에 로그인한 경우가 있다면 store에 있는 tokens 정보들을 세팅
        this.tokens = storeAll.tokens[accounts.selectedAddress];
      }
    } catch (e) {
      console.log('Error initializeTokens ::', e);
    }
  }

  /**
   * switch accounts 시 해당 address의 tokens 정보 체크 없으면 빈 값 저장
   *
   * @returns selectedAddress
   */
  async switchAccounts() {
    try {
      this.#accountStore = await this.getStoreAccounts();
      const { accounts } = this.#accountStore;
      const { tokens } = await this.getTokenStore();
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
    } catch (e) {
      console.log('Error switchAccounts ::', e);
    }
  }

  /**
   * tokenStore 내에서 store.accounts.selectedAddress 와 매칭된 주소의 token 정보를 반환
   *
   * @returns list of token for the selectedAddress token.
   */
  async getTokens() {
    try {
      let tokens = null;
      const { accounts } = await this.getStoreAccounts();
      if (this.tokens?.length > 0) {
        const promiseTokenList = this.tokens.map(async (token) => {
          const balance = await this.#getTokenBalances(
            accounts.selectedAddress,
            token.address,
          );
          return { ...token, balance };
        });
        tokens = await Promise.all(promiseTokenList);
      }
      return tokens;
    } catch (e) {
      console.log('Error getTokens ::', e);
    }
  }

  /**
   * TF-2.0 ...
   * For each token in the tokenlist provided by the TokenListController, check selectedAddress balance.
   * @TODO 이더 or 클레이튼 explorer DB에 유저 EOA를 조회하여 Token 리스트를 받아오기
   */
  async detectNewTokens() {
    const { keyringTokens } = this.#tokenStore;
  }

  /**
   * Adds a token to the stored token list.
   *
   * @param tokenAddress - Hex address of the token contract.
   * @param symbol - Symbol of the token.
   * @param decimals - Number of decimals the token uses.
   * @param image - Image of the token.
   * @returns Added token.
   */
  async addToken(tokenAddress, symbol, decimals, image) {
    try {
      if (!tokenAddress) {
        throw new Error('Invaild contract address.');
      }
      const { accounts } = await this.getStoreAccounts();

      if (!accounts) {
        throw new Error('accounts store data not exist.');
      }
      const { tokens } = await this.getTokenStore();
      const sampleImageURL = `https://placeimg.com/192/192/people`; // 시연용 임시 사진
      const newEntry = {
        address: tokenAddress,
        symbol,
        decimals,
        image: sampleImageURL || image,
      };
      const previousEntry = this.tokens?.find(
        (token) => token.address.toLowerCase() === tokenAddress.toLowerCase(),
      );

      if (previousEntry) {
        // 기존 tokens에 존재하면 token 정보 수정
        const previousIndex = this.tokens.indexOf(previousEntry);
        this.tokens[previousIndex] = newEntry;
        tokens[accounts.selectedAddress].splice(previousIndex, 1, newEntry);
      } else {
        // 신규 토큰 저장
        this.tokens.push(newEntry);
        tokens[accounts.selectedAddress].push(newEntry);
      }
      await this.#setTokenList({ tokens });
      return newEntry;
    } catch (e) {
      console.log('Error addToken ::', e);
    }
  }

  /**
   * ERC-20 Token Transfer RawData 생성 함수
   *
   * @param {string} receiver - 수신자 address
   * @param {number} amount - 전송할 Token 개수
   * @returns
   */
  async transferERC20(receiver, amount) {
    if (amount === 0) {
      console.log('amount is 0', amount);
    }
    const toWeiAmount = Web3.utils.toWei(amount, 'ether');
    const rawHexData = await this.encodeCall(
      'transfer',
      ['address', 'uint256'],
      [receiver, toWeiAmount],
    );
    return rawHexData;
  }

  /**
   * ethererumjs-abi를 통한 rawHexData 생성
   *
   * @param {string} name - contract method name
   * @param {Array<any>} typesList
   * @param {Array<any>} valuesList
   * @returns
   */
  async encodeCall(name, typesList, valuesList) {
    const methodId = abi.methodID(name, typesList).toString('hex');
    const params = abi.rawEncode(typesList, valuesList).toString('hex');
    return `0x${methodId}${params}`;
  }

  /**
   * @TODO rawHexData 리팩토링 필요
   *
   * @param address 잔액을 확인할 EOA
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
    return result ?? null;
  }

  /**
   * @returns {Promise<any>}
   */
  async getTokenStore() {
    const result = await this.#store.get('tokens');
    return result ?? null;
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
