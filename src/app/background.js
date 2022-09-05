import browser from 'webextension-polyfill';

import Controller from './controller';
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
    this.requests = new Map();
  }

  registerMessengerRequests() {
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

    this.requests.set(
      BackgroundMessages.GET_CURRENT_CHAIN_ID,
      this.controller.getCurrentChainId,
    );

    // 니모닉 생성
    this.requests.set(
      BackgroundMessages.GENERATE_MNEMONIC_BG,
      this.controller.generateMnemonic,
    );

    // 니모닉 검증
    this.requests.set(
      BackgroundMessages.VALIDATE_MNEMONIC_BG,
      this.controller.validateMnemonic,
    );

    // 신규 계정 생성
    this.requests.set(
      BackgroundMessages.NEW_ACCOUNT_BG,
      this.controller.newAccount,
    );

    // 계정 복구
    this.requests.set(
      BackgroundMessages.IMPORT_ACCOUNT_BG,
      this.controller.importAccount,
    );

    // 비공개키 추출
    this.requests.set(
      BackgroundMessages.EXPORT_PRIVATE_KEY_BG,
      this.controller.exportPrivateKey,
    );

    // 공개키 추출
    this.requests.set(
      BackgroundMessages.EXPORT_PUBLIC_KEY_BG,
      this.controller.exportPublicKey,
    );

    // 키스토어 v3 추출
    this.requests.set(
      BackgroundMessages.EXPORT_KEYSTORE_V3_BG,
      this.controller.exportKeystoreV3,
    );

    // 계정 가져오기 (비공개 키 or json 파일)
    this.requests.set(
      BackgroundMessages.IMPORT_ACCOUNT_STRATEGY_BG,
      this.controller.importAccountStrategy,
    );

    // store get accounts
    this.requests.set(
      BackgroundMessages.GET_STORE_ACCOUNTS,
      this.controller.getStoreAccounts,
    );

    // store set selected address
    this.requests.set(
      BackgroundMessages.SET_STORE_SELECTED_ADDRESS,
      this.controller.setStoreSelectedAddress,
    );

    this.requests.set(
      BackgroundMessages.SEND_RAW_TRANSACTION,
      this.controller.sendRawTransaction,
    );

    // get tokens for selected address
    this.requests.set(BackgroundMessages.GET_TOKENS, this.controller.getTokens);

    // store set add tokens
    this.requests.set(BackgroundMessages.ADD_TOKEN, this.controller.addToken);
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
  }
}

const initApp = async (remotePort) => {
  // extension close -> re-open 시 event 중복 제거 위해서 추가함
  browser.runtime.onConnect.removeListener(initApp);
  console.log('remotePort: ', remotePort);
  new Background().init();
};

browser.runtime.onConnect.addListener(initApp);
