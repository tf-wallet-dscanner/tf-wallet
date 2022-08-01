/**
 * Provider TODO list
 * 1. 체인 노드는 ethereum(main, testnet(ropsten, rinkeby), klaytn(cypress, baobab), [localhost](http://localhost)
 * 2. extension 실행 시 항상 하나의 체인 노드에 연결되어 있는 provider가 존재 해야 한다.
 * 3. provider는 언제든 유저 이벤트에 따라 변경이 가능하다.
 * 4. provider 연결 이후 다른 controller(tx, keyring)에서 참조 및 사용이 가능해야 한다.
 * 5. provider가 예상치 못한 이슈로 연결이 끊기거나 반응이 없을 시 시스템 log 및 사용자 ui에 표시(알람)를 해야 한다.
 * 6. 첫 provider 연결 이후에도 주기적으로 provider에게 통신 메시지를 날려 정상적으로 연결되어 있는지 확인을 해야한다. (ex. getVersion, getBalance …)
 */
import Web3 from 'web3';

class ProviderController {
  constructor() {
    this.web3 = new Web3(
      new Web3.providers.HttpProvider('http://localhost:8545'),
    );
    console.log('web3: ', this.web3);
  }

  async getAccounts() {
    const accounts = await this.web3.eth.getAccounts();
    return accounts;
  }
}

export default ProviderController;
