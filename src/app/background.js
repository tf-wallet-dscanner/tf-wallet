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
  constructor(remotePort) {
    this.controller = new Controller(remotePort);
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

    // 신규 니모닉 얻기
    this.requests.set(
      BackgroundMessages.GET_NEW_MNEMONIC_BG,
      this.controller.getNewMnemonic,
    );

    // 니모닉 검증
    this.requests.set(
      BackgroundMessages.GET_MNEMONIC_VALIDATE_BG,
      this.controller.getMnemonicValidate,
    );

    // 신규 계정 생성
    this.requests.set(
      BackgroundMessages.NEW_ACCOUNT_BG,
      this.controller.newAccount,
    );

    // 기존 니모닉으로 계정 추가
    this.requests.set(
      BackgroundMessages.ADD_ACCOUNTS,
      this.controller.addAccounts,
    );

    // 계정 복구
    this.requests.set(
      BackgroundMessages.IMPORT_ACCOUNT_BG,
      this.controller.importAccount,
    );

    // 패스워드 확인
    this.requests.set(
      BackgroundMessages.VERIFY_PASSWORD,
      this.controller.verifyPassword,
    );

    // 비공개키 추출
    this.requests.set(
      BackgroundMessages.GET_EXPORT_PRIVATE_KEY_BG,
      this.controller.getExportPrivateKey,
    );

    // 공개키 추출
    this.requests.set(
      BackgroundMessages.GET_EXPORT_PUBLIC_KEY_BG,
      this.controller.getExportPublicKey,
    );

    // 키스토어 v3 추출
    this.requests.set(
      BackgroundMessages.GET_EXPORT_KEYSTORE_V3_BG,
      this.controller.getExportKeystoreV3,
    );

    // 계정 가져오기 (비공개 키 or json 파일)
    this.requests.set(
      BackgroundMessages.GET_IMPORT_ACCOUNT_STRATEGY_BG,
      this.controller.getImportAccountStrategy,
    );

    // keystore -> privKey 추출
    this.requests.set(
      BackgroundMessages.GET_KEYSTORE_TO_PRIVKEY,
      this.controller.getKeystoreToPrivKey,
    );

    // local storage vault 안에서 mnemonic code 추출
    this.requests.set(
      BackgroundMessages.GET_MNEMONIC_FROM_VAULT,
      this.controller.getMnemonicFromVault,
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
      BackgroundMessages.GET_BALANCE,
      this.controller.getBalance,
    );

    this.requests.set(
      BackgroundMessages.GET_TRANSFER_ESTIMATE_GAS,
      this.controller.getTransferEstimateGas,
    );

    this.requests.set(
      BackgroundMessages.SEND_RAW_TRANSACTION,
      this.controller.sendRawTransaction,
    );

    // gas fee estimate setInterval(polling)
    this.requests.set(
      BackgroundMessages.GET_GAS_FEE_ESTIMATES_START_POLLING,
      this.controller.getGasFeeEstimatesAndStartPolling,
    );

    // gas fee estimate
    this.requests.set(
      BackgroundMessages.GET_GAS_FEE_ESTIMATES,
      this.controller.getGasFeeEstimates,
    );

    // get tokens for selected address
    this.requests.set(BackgroundMessages.GET_TOKENS, this.controller.getTokens);

    // store set add tokens
    this.requests.set(BackgroundMessages.ADD_TOKEN, this.controller.addToken);

    // swith main accounts
    this.requests.set(
      BackgroundMessages.SWITCH_ACCOUNTS,
      this.controller.switchAccounts,
    );

    // next Nonce
    this.requests.set(
      BackgroundMessages.GET_NEXT_NONCE,
      this.controller.getNextNonce,
    );

    // set unapproved tx
    this.requests.set(
      BackgroundMessages.SET_UNAPPROVED_TX,
      this.controller.setUnapprovedTx,
    );

    // reset unapproved tx
    this.requests.set(
      BackgroundMessages.RESET_UNAPPROVED_TX,
      this.controller.resetUnapprovedTx,
    );

    // transfer erc20 token
    this.requests.set(
      BackgroundMessages.TRANSFER_ERC20,
      this.controller.transferERC20,
    );

    this.requests.set(
      BackgroundMessages.GET_ETH_TX_HISTORY,
      this.controller.getEthTxHistory,
    );

    this.requests.set(
      BackgroundMessages.GET_ERC20_TRANSFER_HISTORY,
      this.controller.getErc20TransferHistory,
    );

    this.requests.set(
      BackgroundMessages.GET_ERC721_TRANSFER_HISTORY,
      this.controller.getErc721TransferHistory,
    );

    this.requests.set(
      BackgroundMessages.GET_KLAYTN_TX_HISTORY,
      this.controller.getKlaytnTxHistory,
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
  }
}

const initApp = async (remotePort) => {
  // extension close -> re-open 시 event 중복 제거 위해서 추가함
  browser.runtime.onConnect.removeListener(initApp);
  remotePort.onMessage.addListener((msg) => {
    if (msg) {
      new Background(remotePort).init();
    }
  });
};

browser.runtime.onConnect.addListener(initApp);
