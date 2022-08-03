import encryptor from 'browser-passworder';

import Controller from '../controller';
import HdKeyring from '../lib/hd-keyring';

class KeyringController {
  constructor() {
    this.hdKeyring = new HdKeyring();
    this.controller = new Controller();
    this.keyrings = [];
    this.password = '';
  }

  // 니모닉 생성
  async generateMnemonic() {
    const mnemonic = await this.hdKeyring.generateRandomMnemonic();
    return mnemonic;
  }

  // 니모닉 검증
  async validateMnemonic(mnemonic) {
    const validate = await this.hdKeyring.validateMnemonic(mnemonic);
    return validate;
  }

  // 신규 계정 생성
  async createNewAccount({ password, mnemonic }) {
    this.password = password;
    const isValid = await this.hdKeyring.validateMnemonic(mnemonic);

    if (isValid) {
      const accounts = this.hdKeyring.initFromAccount(mnemonic);
      this.keyrings.push(this.hdKeyring);
      this.persistAllKeyrings(password);
      return accounts;
    }

    return null;
  }

  // 키링 배열을 직렬화하고 사용자가 입력한 password로 암호화하여 저장소에 저장
  persistAllKeyrings(password = this.password) {
    if (typeof password !== 'string') {
      return Promise.reject(
        new Error('KeyringController - password is not a string'),
      );
    }

    this.password = password;
    return Promise.all(
      this.keyrings.map((keyring) => {
        return Promise.all([keyring.type, keyring.serialize()]).then(
          (serializedKeyringArray) => {
            // Label the output values on each serialized Keyring:
            return {
              type: serializedKeyringArray[0],
              data: serializedKeyringArray[1],
            };
          },
        );
      }),
    ).then((serializedKeyrings) => {
      return encryptor.encrypt(this.password, serializedKeyrings);
    });
    // .then((encryptedString) => {
    //   this.store.updateState({ vault: encryptedString });
    //   return true;
    // });
  }
}

export default KeyringController;
