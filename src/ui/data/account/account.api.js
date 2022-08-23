import { BackgroundMessages } from 'app/messages';
import Messenger from 'app/messenger';

// 니모닉 생성
export async function generateMnemonic() {
  const mnemonic = await Messenger.sendMessageToBackground(
    BackgroundMessages.GENERATE_MNEMONIC_BG,
  );
  return mnemonic;
}

// 니모닉 검증
export async function validateMnemonic(mnemonic) {
  const validate = await Messenger.sendMessageToBackground(
    BackgroundMessages.VALIDATE_MNEMONIC_BG,
    { mnemonic },
  );
  return validate;
}

// 신규 계정 생성
export async function newAccount({ password, mnemonic }) {
  const accounts = await Messenger.sendMessageToBackground(
    BackgroundMessages.NEW_ACCOUNT_BG,
    { password, mnemonic },
  );
  return accounts;
}

// 계정 복구
export async function importAccount({ password, mnemonic }) {
  const accounts = await Messenger.sendMessageToBackground(
    BackgroundMessages.IMPORT_ACCOUNT_BG,
    { password, mnemonic },
  );
  return accounts;
}

// privateKey 추출
export async function exportPrivateKey({ address, password }) {
  const privateKey = await Messenger.sendMessageToBackground(
    BackgroundMessages.EXPORT_PRIVATE_KEY_BG,
    { address, password },
  );
  return privateKey;
}

// publicKey 추출
export async function exportPublicKey({ address, password }) {
  const publicKey = await Messenger.sendMessageToBackground(
    BackgroundMessages.EXPORT_PUBLIC_KEY_BG,
    { address, password },
  );
  return publicKey;
}

// keystore v3 추출
export async function exportKeystoreV3({ privateKey, password }) {
  const keystoreV3 = await Messenger.sendMessageToBackground(
    BackgroundMessages.EXPORT_KEYSTORE_V3_BG,
    { privateKey, password },
  );
  return keystoreV3;
}

// 계정 가져오기 (privKey, json 파일) - v3
export async function importAccountStrategy({ strategy, args }) {
  const selectedAddress = await Messenger.sendMessageToBackground(
    BackgroundMessages.IMPORT_ACCOUNT_STRATEGY_BG,
    { strategy, args },
  );
  return selectedAddress;
}

// store에서 accounts 정보 Get
export async function getStoreAccounts() {
  const accounts = await Messenger.sendMessageToBackground(
    BackgroundMessages.GET_STORE_ACCOUNTS,
  );
  return accounts;
}

// store에서 accounts selectedAddress 정보 set
export async function setStoreSelectedAddress(selectedAddress) {
  const response = await Messenger.sendMessageToBackground(
    BackgroundMessages.SET_STORE_SELECTED_ADDRESS,
    { selectedAddress },
  );
  return response;
}
