import browser from 'webextension-polyfill';

import Controller from './controller';
import KeyringController from './controllers/keyring-controller';
import NotificationManager from './lib/notification-manager';
import { BackgroundMessages } from './messages';

const notificationManager = new NotificationManager();

/**
 * Opens the browser popup for user confirmation
 */
async function triggerUi() {
  await notificationManager.showPopup();
}

class Background {
  constructor() {
    this.controller = new Controller();
    this.keyringController = new KeyringController();
    this.requests = new Map();
  }

  async receiveHello(sender, data) {
    console.log('BG: receiveHello: ', sender, data);
    return {
      message: 'Hey there!!!',
    };
  }

  async receiveSetAddress(sender, data) {
    console.log('BG: receiveSetAddress: ', sender, data);
    await this.controller.store.set({ address: data.message });
    const res = await this.controller.store.get('address');
    console.log('BG: get store', res);
    return {
      message: res,
    };
  }

  // 니모닉 구문 생성
  async receiveGenerateMnemonic() {
    const mnemonic = await this.controller.keyringController.generateMnemonic();
    return mnemonic;
  }

  // 니모닉 코드 검증
  async receiveValidateMnemonic(sender, { mnemonic }) {
    const validate = await this.controller.keyringController.validateMnemonic(
      mnemonic,
    );
    return validate;
  }

  // 신규 계정 생성
  async receiveNewAccount(sender, data) {
    const accounts = await this.controller.keyringController.createNewAccount(
      data,
    );
    return accounts;
  }

  // 계정 복구
  async receiveImportAccount(sender, { password, mnemonic }) {
    const { vault, accounts } =
      await this.controller.keyringController.createNewVaultAndRestore({
        password,
        mnemonic,
      });
    // private Key 추출할때 패스워드 검증위해 vault 일단 저장 시켜놈
    await this.controller.store.set({ vault });
    return accounts;
  }

  // 비공개키 추출
  async receiveExportPrivateKey(sender, { address, password }) {
    // 비밀번호 검증
    await this.controller.keyringController.verifyPassword(password);
    const privateKey = await this.controller.keyringController.exportKey({
      keyType: 'private',
      address,
    });
    return privateKey;
  }

  // 공개키 추출
  async receiveExportPublicKey(sender, { address, password }) {
    // 비밀번호 검증
    await this.controller.keyringController.verifyPassword(password);
    const publicKey = await this.controller.keyringController.exportKey({
      keyType: 'public',
      address,
    });
    return publicKey;
  }

  registerMessengerRequests() {
    this.requests.set(
      BackgroundMessages.SAY_HELLO_TO_BG,
      this.receiveHello.bind(this),
    );

    this.requests.set(
      BackgroundMessages.SET_ADDRESS_TO_BG,
      this.receiveSetAddress.bind(this),
    );

    this.requests.set(
      BackgroundMessages.GET_LATEST_BLOCK,
      this.controller.getLatestBlock,
    );

    this.requests.set(
      BackgroundMessages.GET_NETWORK_ID,
      this.controller.getNetworkId,
    );

    this.requests.set(
      BackgroundMessages.SET_RPC_TARGET,
      this.controller.setRpcTarget,
    );

    this.requests.set(
      BackgroundMessages.SET_PROVIDER_TYPE,
      this.controller.setProviderType,
    );

    // 니모닉 생성
    this.requests.set(
      BackgroundMessages.GENERATE_MNEMONIC_BG,
      this.receiveGenerateMnemonic.bind(this),
    );

    // 니모닉 검증
    this.requests.set(
      BackgroundMessages.VALIDATE_MNEMONIC_BG,
      this.receiveValidateMnemonic.bind(this),
    );

    // 신규 계정 생성
    this.requests.set(
      BackgroundMessages.NEW_ACCOUNT_BG,
      this.receiveNewAccount.bind(this),
    );

    // 계정 복구
    this.requests.set(
      BackgroundMessages.IMPORT_ACCOUNT_BG,
      this.receiveImportAccount.bind(this),
    );

    // 비공개키 추출
    this.requests.set(
      BackgroundMessages.EXPORT_PRIVATE_KEY_BG,
      this.receiveExportPrivateKey.bind(this),
    );

    // 공개키 추출
    this.requests.set(
      BackgroundMessages.EXPORT_PUBLIC_KEY_BG,
      this.receiveExportPublicKey.bind(this),
    );
  }

  listenForMessages() {
    browser.runtime.onMessage.addListener(async (message, sender) => {
      const { type, data } = message;
      if (type === BackgroundMessages.INPAGE_TO_BG) {
        // 팝업 띄우기
        await triggerUi();
        return null;
      } else {
        return this.requests.get(type)?.(sender, data);
      }
    });
  }

  async init() {
    // 1. Create a mapping for message listeners
    this.registerMessengerRequests();

    // 2. Listen for messages from background and run the listener from the map
    this.listenForMessages();

    // Send message to content script of active tab after 10000 ms
    setInterval(() => {
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        tabs.forEach((tab) => {
          console.log('tab.id:', tab.id);
        });
      });
    }, 10000);
  }
}

const initApp = async (remotePort) => {
  // extension close -> re-open 시 event 중복 제거 위해서 추가함
  browser.runtime.onConnect.removeListener(initApp);
  console.log('remotePort: ', remotePort);
  new Background().init();
};

browser.runtime.onConnect.addListener(initApp);
