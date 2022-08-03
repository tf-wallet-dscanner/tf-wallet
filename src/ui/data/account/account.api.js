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
