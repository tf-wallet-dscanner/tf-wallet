/**
 * Provider TODO list
 * 1. 체인 노드는 ethereum(main, testnet(ropsten, rinkeby), klaytn(cypress, baobab), [localhost](http://localhost)
 * 2. extension 실행 시 항상 하나의 체인 노드에 연결되어 있는 provider가 존재 해야 한다.
 * 3. provider는 언제든 유저 이벤트에 따라 변경이 가능하다.
 * 4. provider 연결 이후 다른 controller(tx, keyring)에서 참조 및 사용이 가능해야 한다.
 * 5. provider가 예상치 못한 이슈로 연결이 끊기거나 반응이 없을 시 시스템 log 및 사용자 ui에 표시(알람)를 해야 한다.
 * 6. 첫 provider 연결 이후에도 주기적으로 provider에게 통신 메시지를 날려 정상적으로 연결되어 있는지 확인을 해야한다. (ex. getId, getBalance …)
 */
import {
  CHAIN_ID_TO_RPC_URL_MAP,
  CHAIN_ID_TO_TYPE_MAP,
  INFURA_PROVIDER_TYPES,
  MAINNET,
  MAINNET_CHAIN_ID,
  MAINNET_RPC_URL,
  NETWORK_TYPE_RPC,
  NETWORK_TYPE_TO_ID_MAP,
} from 'app/constants/network';
import EthQuery from 'app/lib/eth-query';
import {
  isPrefixedFormattedHexString,
  isSafeChainId,
} from 'app/modules/network.utils';
import { strict as assert } from 'assert';
import EventEmitter from 'events';

/**
 * 1. 사용자가 provider를 선택할 수 있다
 *  - default로 mainnet이 선택되게끔 한다. (controller를 생성할 때 option 값을 받을 수 있다.)
 *  - 사용자는 mainnet, ropsten, localhost 환경을 자유자재로 바꿀 수 있다.
 *  - 이더리움은 네트워크는 Infura(https://mainnet.infura.io/v3/YOUR-PROJECT-ID)를 사용한다.
 *    - process.env.INFURA_PROJECT_ID
 *    - https://${network}.infura.io/v3/${this._infuraProjectId}
 *  - provider가 바뀔 때 event를 일으켜서 진행하고 있던 트랜잭션 등을 clear 해야한다.
 *
 * 2. provider가 유지되어야 한다.
 *  - localstore에 마지막 provider 설정값을 저장해야한다. ( 확장프로그램을 껐다켜도 내가 선택했던 provider를 유지 )
 *  - 노드에 getBalance(address) 와 같은 api를 지속적으로 호출해서 연결을 유지하고 있는지 확인해야 한다. - PollingBlockTracker
 */
export const NETWORK_EVENTS = {
  // Fired after the actively selected network is changed
  NETWORK_DID_CHANGE: 'networkDidChange',
  // Fired when the actively selected network *will* change
  NETWORK_WILL_CHANGE: 'networkWillChange',
  // Fired when Infura returns an error indicating no support
  INFURA_IS_BLOCKED: 'infuraIsBlocked',
  // Fired when not using an Infura network or when Infura returns no error, indicating support
  INFURA_IS_UNBLOCKED: 'infuraIsUnblocked',
};

const defaultProviderConfig = {
  type: MAINNET,
  rpcUrl: MAINNET_RPC_URL,
  chainId: MAINNET_CHAIN_ID,
};

class ProviderController extends EventEmitter {
  /**
   * @see https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Classes/Private_class_fields
   * @see https://ui.toast.com/weekly-pick/ko_20210901
   * @desc Private class fields - babel로 transfiling 하고 나면 WeakMap() 으로 변환된다.
   */
  #providerStore;

  #infuraProjectId;

  #networkId;

  constructor(opts = {}) {
    super();

    this.#providerStore = opts.store;
    this.#providerStore.set({
      ...defaultProviderConfig,
    });
    this.#setInfuraProjectId = opts.infuraProjectId;
    this.on(NETWORK_EVENTS.NETWORK_DID_CHANGE, this.lookupNetwork);
  }

  async lookupNetwork() {
    // Prevent firing when provider is not defined.
    if (!this.#providerStore) {
      console.warn(
        'NetworkController - lookupNetwork aborted due to missing provider',
      );
      return;
    }

    const chainId = await this.getCurrentChainId();
    if (!chainId) {
      console.warn(
        'NetworkController - lookupNetwork aborted due to missing chainId',
      );
      return;
    }

    // Ping the RPC endpoint so we can confirm that it works
    const { type } = await this.getProviderConfig;
    const isInfura = INFURA_PROVIDER_TYPES.includes(type);

    if (this.#infuraProjectId && isInfura) {
      this.#checkInfuraAvailability();
    } else {
      this.emit(NETWORK_EVENTS.INFURA_IS_UNBLOCKED);
    }

    const networkId = await this.getNetworkId();
    this.#networkId = networkId;
  }

  /**
   * Sets the Infura project ID
   *
   * @param {string} projectId - The Infura project ID
   * @throws {Error} If the project ID is not a valid string.
   */
  set #setInfuraProjectId(projectId) {
    if (!projectId || typeof projectId !== 'string') {
      throw new Error('Invalid Infura project ID');
    }

    this.#infuraProjectId = projectId;
  }

  /**
   * infura network 사용 가능여부 체크
   */
  async #checkInfuraAvailability() {
    const { rpcUrl } = await this.provideConfig;
    const ethQuery = new EthQuery(rpcUrl);

    let networkChanged = false;
    this.once(NETWORK_EVENTS.NETWORK_DID_CHANGE, () => {
      networkChanged = true;
    });

    try {
      const response = await ethQuery.getBlockNumber();

      if (networkChanged) {
        return;
      }

      if (response) {
        this.emit(NETWORK_EVENTS.INFURA_IS_UNBLOCKED);
      } else {
        if (networkChanged) {
          return;
        }
        this.emit(NETWORK_EVENTS.INFURA_IS_BLOCKED);
      }
    } catch (e) {
      console.warn(`ProviderController - Infura availability check failed`, e);
    }
  }

  /**
   * 사용자 정의 rpcUrl을 사용하는 provider 설정
   * @param {string} rpcUrl 사용자가 설정한 rpcUrl (ex. 192.168.10.23:8484)
   * @param {string} chainId
   */
  setRpcTarget(rpcUrl, chainId) {
    assert.ok(
      isPrefixedFormattedHexString(chainId),
      `Invalid chain ID "${chainId}": invalid hex string.`,
    );
    assert.ok(
      isSafeChainId(parseInt(chainId, 16)),
      `Invalid chain ID "${chainId}": numerical value greater than max safe value.`,
    );
    this.#setProviderConfig({
      type: NETWORK_TYPE_RPC,
      rpcUrl,
      chainId,
    });
  }

  /**
   * infura, localhost provider 설정
   * @param {string} chainId
   */
  setProviderType(chainId) {
    const type = CHAIN_ID_TO_TYPE_MAP[chainId];

    assert.notStrictEqual(
      type,
      NETWORK_TYPE_RPC,
      `NetworkController - cannot call "setProviderType" with type "${NETWORK_TYPE_RPC}". Use "setRpcTarget"`,
    );
    assert.ok(
      INFURA_PROVIDER_TYPES.includes(type),
      `Unknown Infura provider type "${type}".`,
    );

    this.#setProviderConfig({
      type,
      rpcUrl: CHAIN_ID_TO_RPC_URL_MAP[chainId],
      chainId,
    });
  }

  async resetConnection() {
    const providerConfig = await this.provideConfig;
    this.#setProviderConfig(providerConfig);
  }

  /**
   * provider 설정 변경 시 event 전파하여 다른 controller도 제어할 수 있게함
   * @param {*} config provider config object
   */
  #switchNetwork(config) {
    // Indicate to subscribers that network is about to change
    this.emit(NETWORK_EVENTS.NETWORK_WILL_CHANGE);
    // Notify subscribers that network has changed
    this.emit(NETWORK_EVENTS.NETWORK_DID_CHANGE, config.type);
  }

  /**
   * set provider config
   * @param {Object} providerConfig
   */
  #setProviderConfig(config) {
    this.#providerStore.set({
      ...config,
    });
    this.#switchNetwork(config);
  }

  /**
   * @returns {Promise<any>}
   */
  get provideConfig() {
    return this.#providerStore.getAll();
  }

  /**
   * get network id(ex. mainnet: 1)
   * @returns {string}
   */
  get networkId() {
    return this.#networkId;
  }

  /**
   * @returns {Promise<string>} chainId
   */
  async getCurrentChainId() {
    const { type, chainId: configChainId } = await this.getProviderConfig;
    return NETWORK_TYPE_TO_ID_MAP[type]?.chainId || configChainId;
  }

  /**
   * @returns {Promise<Block>} Block object
   */
  async getLatestBlock() {
    const { rpcUrl } = await this.provideConfig;
    const ethQuery = new EthQuery(rpcUrl);
    return ethQuery.getLatestBlock();
  }

  /**
   * @returns {Promise<string>} networkId
   */
  async getNetworkId() {
    const { rpcUrl } = await this.provideConfig;
    const ethQuery = new EthQuery(rpcUrl);
    return ethQuery.getNetworkId();
  }
}

export default ProviderController;
