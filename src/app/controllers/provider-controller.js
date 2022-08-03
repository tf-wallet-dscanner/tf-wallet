/**
 * Provider TODO list
 * 1. 체인 노드는 ethereum(main, testnet(ropsten, rinkeby), klaytn(cypress, baobab), [localhost](http://localhost)
 * 2. extension 실행 시 항상 하나의 체인 노드에 연결되어 있는 provider가 존재 해야 한다.
 * 3. provider는 언제든 유저 이벤트에 따라 변경이 가능하다.
 * 4. provider 연결 이후 다른 controller(tx, keyring)에서 참조 및 사용이 가능해야 한다.
 * 5. provider가 예상치 못한 이슈로 연결이 끊기거나 반응이 없을 시 시스템 log 및 사용자 ui에 표시(알람)를 해야 한다.
 * 6. 첫 provider 연결 이후에도 주기적으로 provider에게 통신 메시지를 날려 정상적으로 연결되어 있는지 확인을 해야한다. (ex. getVersion, getBalance …)
 */
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

class ProviderController extends EventEmitter {
  // eslint-disable-next-line no-unused-vars
  constructor(opts = {}) {
    super();
  }

  initalizeProvider(providerParams) {
    // this._baseProviderParams = providerParams;
    // const { type, rpcUrl, chainId } = this.getProviderConfig();
    // this._configureProvider({ type, rpcUrl, chainId });
    // this.lookupNetwork();
    this.#configureProvider(providerParams);
  }

  #configureProvider() {
    console.log('');
  }

  _switchNetwork() {
    console.log('switch network');
  }
}

export default ProviderController;
