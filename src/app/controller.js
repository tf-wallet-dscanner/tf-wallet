import KeyringController from './controllers/keyring-controller';
import ProviderController from './controllers/provider-controller';
import ExtensionStore from './lib/localstore';

class Controller {
  constructor() {
    this.store = new ExtensionStore();

    this.providerController = new ProviderController({
      store: this.store,
      infuraProjectId: process.env.INFURA_PROJECT_ID,
    });
    this.providerController.initializeProvider();

    this.keyringController = new KeyringController({
      store: this.store,
    });
  }

  getLatestBlock = async () => {
    const block = await this.providerController.getLatestBlock();
    return {
      block,
    };
  };

  getNetworkId = async () => {
    const networkId = await this.providerController.getNetworkId();
    return {
      networkId,
    };
  };

  setRpcTarget = (_, { rpcUrl, chainId }) => {
    return Promise.resolve(
      this.providerController.setRpcTarget(rpcUrl, chainId),
    );
  };

  setProviderType = (_, { chainId }) => {
    return Promise.resolve(this.providerController.setProviderType(chainId));
  };

  getCurrentChainId = async () => {
    const chainId = await this.providerController.getCurrentChainId();
    return {
      chainId,
    };
  };

  // 니모닉 구문 생성
  generateMnemonic = async () => {
    return Promise.resolve(this.keyringController.generateMnemonic());
  };

  // 니모닉 코드 검증
  validateMnemonic = async (_, { mnemonic }) => {
    return Promise.resolve(this.keyringController.validateMnemonic(mnemonic));
  };

  // 신규 계정 생성
  newAccount = async (_, { password, mnemonic }) => {
    const accounts = await this.keyringController.createNewAccount({
      password,
      mnemonic,
    });
    return accounts;
  };

  // 계정 복구
  importAccount = async (_, { password, mnemonic }) => {
    const accounts = await this.keyringController.createNewVaultAndRestore({
      password,
      mnemonic,
    });
    return accounts;
  };

  // 비공개키 추출
  exportPrivateKey = async (_, { address, password }) => {
    // 비밀번호 검증
    await this.keyringController.verifyPassword(password);
    const privateKey = await this.keyringController.exportKey({
      keyType: 'private',
      address,
    });
    return privateKey;
  };

  // 공개키 추출
  exportPublicKey = async (_, { address, password }) => {
    // 비밀번호 검증
    await this.keyringController.verifyPassword(password);
    const publicKey = await this.keyringController.exportKey({
      keyType: 'public',
      address,
    });
    return publicKey;
  };

  // 키스토어 v3 추출
  exportKeystoreV3 = async (_, { privateKey, password }) => {
    const keystoreV3 = await this.keyringController.exportKeystoreV3({
      privateKey,
      password,
    });
    return keystoreV3;
  };

  sendRawTransaction = async (_, { from, to, decimalValue }) => {
    const txResult = await this.providerController.sendRawTransaction(
      from,
      to,
      decimalValue,
    );
    return {
      txResult,
    };
  };
}

export default Controller;
