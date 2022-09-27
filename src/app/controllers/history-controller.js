import { ObservableStore } from '@metamask/obs-store';
import {
  INFURA_PROVIDER_TYPES,
  KLAYTN_PROVIDER_TYPES,
  MAINNET,
} from 'app/constants/network';
import { SECOND } from 'app/constants/time';
import getFetchWithTimeout from 'app/modules/fetch-with-timeout';
import EventEmitter from 'events';
import qs from 'qs';

export const ETHERSCAN_API_TYPE = {
  TX_LIST: 'txlist',
  TOKEN_LIST: 'tokentx',
  TOKEN_NFT_LIST: 'tokennfttx',
};

export const KLAYTON_API_TYPE = {
  TX_LIST: 'klaytn_txlist',
};

const fetchWithTimeout = getFetchWithTimeout(SECOND * 30);

const defaultHistoryState = {
  ethTransactions: [],
  erc20transfers: [],
  erc721transfers: [],
  klaytnTransactions: [],
};

export const HISTORY_EVENTS = {
  TX_LIST_DID_CHANGE: 'txlistDidChange',
  ERC20_LIST_DID_CHANGE: 'tokentxDidChange',
  ERC721_LIST_DID_CHANGE: 'tokennefttxDidChange',
  KLAYTN_TX_LIST_DID_CHANGE: 'klaytn_txlistDidChange',
};

class HistoryController extends EventEmitter {
  #store;

  #historyStore;

  constructor({ store, onNetworkStateChange }) {
    super();
    this.#store = store;
    this.#historyStore = new ObservableStore({
      ...defaultHistoryState,
    });
    onNetworkStateChange(async () => {
      await this.stopPolling();
      const { type: network } = await this.#config;
      const isInfura = INFURA_PROVIDER_TYPES.includes(network);
      const isKlaytn = KLAYTN_PROVIDER_TYPES.includes(network);
      const pollType = isInfura
        ? ETHERSCAN_API_TYPE.TX_LIST
        : isKlaytn
        ? KLAYTON_API_TYPE.TX_LIST
        : '';
      console.log('pollType: ', pollType);
      this.startPolling(pollType);
    });
  }

  /**
   * @see https://docs.etherscan.io/getting-started/endpoint-urls
   * @typedef {Object} EtherscanApiType
   * @param {object} queryParams
   * @param {string} queryParams.network
   * @param {ETHERSCAN_API_TYPE[keyof ETHERSCAN_API_TYPE]} queryParams.action - api type
   * @param {number} queryParams.startblock - start block number
   * @param {string} queryParams.address - EOA
   * @param {string} queryParams.contractAddress - CA(optional)
   * @returns {string} etherscan api url
   */
  #getEtherscanApiUrl(queryParams) {
    const ethereumSubdomain =
      queryParams.network === MAINNET ? 'api' : `api-${queryParams.network}`;

    delete queryParams.network;
    const params = {
      module: 'account',
      startblock: 0,
      page: 1,
      sort: 'desc',
      apikey: process.env.ETHERSCAN_API_KEY,
      ...queryParams,
    };

    const querystring = qs.stringify(params);
    return `https://${ethereumSubdomain}.etherscan.io/api?${querystring}`;
  }

  async #fetchEtherscanApi(params) {
    try {
      const {
        type: network,
        accounts: { selectedAddress },
      } = await this.#config;
      const apiUrl = this.#getEtherscanApiUrl({
        network,
        address: selectedAddress,
        ...params,
      });
      const response = await fetchWithTimeout(apiUrl);

      if (response.ok) {
        const { result } = await response.json();
        return result;
      }

      return response;
    } catch (e) {
      console.error('HistoryController - fetchEtherscanApi Error - ', e);
    }
  }

  /**
   * eth transaction 내역 조회
   * @returns {Promise<void>} ether transaction history
   */
  async getEthTxHistoryByAddress() {
    try {
      const ethTxHistory = await this.#fetchEtherscanApi({
        action: ETHERSCAN_API_TYPE.TX_LIST,
      });
      this.#historyStore.updateState({
        ethTransactions: ethTxHistory,
      });
      this.emit(HISTORY_EVENTS.TX_LIST_DID_CHANGE, ethTxHistory);
    } catch (e) {
      console.error('HistoryController - getEthTxHistoryByAddress Error - ', e);
    }
  }

  /**
   * ERC20 토큰 거래내역 조회
   * @param {string} contractAddress
   * @returns {Promise<void>} ERC20TransferHistory
   */
  async getERC20TransferHistoryByAddress(contractAddress) {
    try {
      const transferHistory = await this.#fetchEtherscanApi({
        action: ETHERSCAN_API_TYPE.TOKEN_LIST,
        contractAddress,
      });
      this.#historyStore.updateState({
        erc20transfers: transferHistory,
      });
    } catch (e) {
      console.error(
        'HistoryController - getERC20TransferHistoryByAddress Error - ',
        e,
      );
    }
  }

  /**
   * ERC721 토큰 거래내역 조회
   * @param {string} contractAddress
   * @returns {Promise<void>} ERC721TransferHistory
   */
  async getERC721TransferHistoryByAddress(contractAddress) {
    try {
      const transferHistory = await this.#fetchEtherscanApi({
        action: ETHERSCAN_API_TYPE.TOKEN_NFT_LIST,
        contractAddress,
      });
      this.#historyStore.updateState({
        erc721transfers: transferHistory,
      });
    } catch (e) {
      console.error(
        'HistoryController - getERC721TransferHistoryByAddress Error - ',
        e,
      );
    }
  }

  /**
   * klaytn transaction 내역 조회
   * @returns {Promise<void>} klaytn transaction history
   */
  async getKlaytnTxHistoryByAddress() {
    try {
      // TODO: endpoint, query, event type 등 수정 필요
      const response = await fetch('https://api.spacex.land/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
          {
            company {
              ceo
            }
            roadster {
              apoapsis_au
            }
          }
        `,
        }),
      });
      const { data } = await response.json();
      console.log('data: ', data);
      this.#historyStore.updateState({
        klaytnTransactions: [data],
      });
      this.emit(HISTORY_EVENTS.KLAYTN_TX_LIST_DID_CHANGE, [data]);
    } catch (e) {
      console.error(
        'HistoryController - getKlaytnTxHistoryByAddress Error - ',
        e,
      );
    }
  }

  /**
   *
   * @param {typeof ETHERSCAN_API_TYPE} type
   */
  startPolling(type) {
    let cb;
    switch (type) {
      case ETHERSCAN_API_TYPE.TX_LIST:
        cb = this.getEthTxHistoryByAddress.bind(this);
        break;
      case ETHERSCAN_API_TYPE.TOKEN_LIST:
        cb = this.getERC20TransferHistoryByAddress.bind(this);
        break;
      case ETHERSCAN_API_TYPE.TOKEN_NFT_LIST:
        cb = this.getERC721TransferHistoryByAddress.bind(this);
        break;
      case KLAYTON_API_TYPE.TX_LIST:
        cb = this.getKlaytnTxHistoryByAddress.bind(this);
        break;
      default:
        cb = this.getEthTxHistoryByAddress.bind(this);
        break;
    }

    // TODO: ERC20, ERC721 polling 시나리오 필요
    cb();
    const pollingId = setInterval(cb, SECOND * 10);
    this.#historyStore.updateState({
      historyPollingId: pollingId,
    });
  }

  stopPolling() {
    const { historyPollingId } = this.#historyStore.getState();
    clearInterval(historyPollingId);
  }

  /**
   * @returns {Promise<any>}
   */
  get #config() {
    return this.#store.getAll();
  }

  /**
   * eth transaction list
   * @returns {Array<object>}
   */
  get ethTransactions() {
    const { ethTransactions } = this.#historyStore.getState();
    return ethTransactions;
  }

  /**
   * eth transaction list
   * @returns {Array<object>}
   */
  get erc20transfers() {
    const { erc20transfers } = this.#historyStore.getState();
    return erc20transfers;
  }

  /**
   * eth transaction list
   * @returns {Array<object>}
   */
  get erc721transfers() {
    const { erc721transfers } = this.#historyStore.getState();
    return erc721transfers;
  }

  /**
   * klaytn transaction list
   * @returns {Array<object>}
   */
  get klaytnTransactions() {
    const { klaytnTransactions } = this.#historyStore.getState();
    return klaytnTransactions;
  }
}

export default HistoryController;
