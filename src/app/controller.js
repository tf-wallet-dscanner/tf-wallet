import EventEmitter from 'events';

import { MAINNET_CHAIN_ID } from './constants/network';
import { SECOND } from './constants/time';
import { GasFeeController } from './controllers/gas/gas-fee-controller';
import KeyringController from './controllers/keyring-controller';
import ProviderController, {
  NETWORK_EVENTS,
} from './controllers/provider-controller';
import TransactionController from './controllers/transactions/transaction-controller';
import ExtensionStore from './lib/localstore';

class Controller extends EventEmitter {
  constructor() {
    super();
    this.store = new ExtensionStore();

    this.providerController = new ProviderController({
      store: this.store,
      infuraProjectId: process.env.INFURA_PROJECT_ID,
    });
    this.providerController.initializeProvider().then(() => {
      this.gasFeeController = new GasFeeController({
        interval: SECOND * 10,
        getProvider: this.providerController.getProvider.bind(
          this.providerController,
        ),
        onNetworkStateChange: this.providerController.on.bind(
          this.providerController,
          NETWORK_EVENTS.NETWORK_DID_CHANGE,
        ),
        getCurrentNetworkEIP1559Compatibility:
          this.providerController.getEIP1559Compatibility.bind(
            this.providerController,
          ),
        getCurrentNetworkLegacyGasAPICompatibility: () => {
          const chainId = this.providerController.getCurrentChainId();
          return chainId === MAINNET_CHAIN_ID;
        },
        getChainId: () => {
          return this.providerController.getCurrentChainId();
        },
      });
    });

    this.keyringController = new KeyringController({
      store: this.store,
      getProvider: this.providerController.getProvider.bind(
        this.providerController,
      ),
    });

    this.txController = new TransactionController({
      store: this.store,
      getProvider: this.providerController.getProvider.bind(
        this.providerController,
      ),
      unlockKeyrings: this.keyringController.unlockKeyrings.bind(
        this.keyringController,
      ),
      signTransaction: this.keyringController.signTransaction.bind(
        this.keyringController,
      ),
      getEIP1559Compatibility:
        this.providerController.getEIP1559Compatibility.bind(
          this.providerController,
        ),
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

  // 계정 가져오기 (비공개 키 or json 파일)
  importAccountStrategy = (_, { strategy, args }) => {
    const selectedAddress = this.keyringController.importAccountStrategy({
      strategy,
      args,
    });
    return selectedAddress;
  };

  // store get accounts
  getStoreAccounts = async (_) => {
    const accounts = await this.keyringController.getStoreAccounts();
    return accounts;
  };

  // store set selected address
  setStoreSelectedAddress = async (_, { selectedAddress }) => {
    return Promise.resolve(
      this.keyringController.updateStoreSelectedAddress(selectedAddress),
    );
  };

  // transaction send test
  sendRawTransaction = async (_, { password, to, decimalValue }) => {
    const txResult = await this.txController.sendRawTransaction(
      password,
      to,
      decimalValue,
    );
    return {
      txResult,
    };
  };
}

export default Controller;
