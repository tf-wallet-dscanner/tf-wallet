import { BackgroundMessages } from 'app/messages';
import Messenger from 'app/messenger';

// 신규 니모닉 얻기
export async function getNewMnemonic() {
  const mnemonic = await Messenger.sendMessageToBackground(
    BackgroundMessages.GET_NEW_MNEMONIC_BG,
  );
  return mnemonic;
}

// 니모닉 검증
export async function getMnemonicValidate(mnemonic) {
  const validate = await Messenger.sendMessageToBackground(
    BackgroundMessages.GET_MNEMONIC_VALIDATE_BG,
    { mnemonic },
  );
  return validate;
}

// 신규 계정 생성
export async function newAccount({ mnemonic, password }) {
  const accounts = await Messenger.sendMessageToBackground(
    BackgroundMessages.IMPORT_ACCOUNT_BG,
    { mnemonic, password },
  );
  return accounts;
}

// 계정 추가
export async function addAccounts() {
  const accounts = await Messenger.sendMessageToBackground(
    BackgroundMessages.ADD_ACCOUNTS,
  );
  return accounts;
}

// 계정 복구
export async function importAccount({ mnemonic, password }) {
  const accounts = await Messenger.sendMessageToBackground(
    BackgroundMessages.IMPORT_ACCOUNT_BG,
    { mnemonic, password },
  );
  return accounts;
}

// 계정 복구
export async function verifyPassword({ password }) {
  const accounts = await Messenger.sendMessageToBackground(
    BackgroundMessages.VERIFY_PASSWORD,
    { password },
  );
  return accounts;
}

// privateKey 추출
export async function getExportPrivateKey({ address, password }) {
  const privateKey = await Messenger.sendMessageToBackground(
    BackgroundMessages.GET_EXPORT_PRIVATE_KEY_BG,
    { address, password },
  );
  console.warn('privateKey: ', privateKey);
  return privateKey;
}

// publicKey 추출
export async function getExportPublicKey({ address, password }) {
  const publicKey = await Messenger.sendMessageToBackground(
    BackgroundMessages.GET_EXPORT_PUBLIC_KEY_BG,
    { address, password },
  );
  return publicKey;
}

// keystore v3 추출
export async function getExportKeystoreV3({ privateKey, password }) {
  const keystoreV3 = await Messenger.sendMessageToBackground(
    BackgroundMessages.GET_EXPORT_KEYSTORE_V3_BG,
    { privateKey, password },
  );
  return keystoreV3;
}

/**
 * 비공개키 / keystore.json으로 주소값 뽑기
 * @param {string} strategy - import 유형 (Private Key, JSON File)
 * @param {object} args - { password: 비밀번호, privateKey || fileContents: 타입에 따라 비공개 키 or JSON File }
 */
export async function getImportAccountStrategy({ strategy, args }) {
  const selectedAddress = await Messenger.sendMessageToBackground(
    BackgroundMessages.GET_IMPORT_ACCOUNT_STRATEGY_BG,
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

// keystore json 파일 -> private key 추출
export async function getKeystoreToPrivKey({ fileContents, password }) {
  const privKey = await Messenger.sendMessageToBackground(
    BackgroundMessages.GET_KEYSTORE_TO_PRIVKEY,
    { fileContents, password },
  );
  return privKey;
}
