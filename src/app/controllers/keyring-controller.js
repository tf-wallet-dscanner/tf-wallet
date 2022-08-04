import encryptor from 'browser-passworder';

import HdKeyring from '../lib/hd-keyring';
import { normalize, stripHexPrefix } from '../lib/util';

const bip39 = require('bip39');

const KEYRINGS_TYPE_MAP = {
  HD_KEYRING: 'HD Key Tree',
  SIMPLE_KEYRING: 'Simple Key Pair',
};

class KeyringController {
  constructor(opts = {}) {
    this.hdKeyring = new HdKeyring();
    this.keyrings = [];
    this.password = '';
    this.store = opts.store || {};
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

  // 계정 복구
  async createNewVaultAndRestore({ password, mnemonic }) {
    // 니모닉 단어 리스트 검증
    const wordlists = Object.values(bip39.wordlists);
    if (
      wordlists.every((wordlist) => !bip39.validateMnemonic(mnemonic, wordlist))
    ) {
      return Promise.reject(new Error('Seed phrase is invalid.'));
    }

    this.clearKeyrings();
    await this.persistAllKeyrings(password);

    // add new keyring
    const keyring = new HdKeyring({
      mnemonic,
      numberOfAccounts: 1,
    });

    const accounts = await keyring.getAccounts();
    this.checkForDuplicate(KEYRINGS_TYPE_MAP.HD_KEYRING, accounts);
    if (!accounts.length)
      throw new Error('KeyringController - First Account not found.');

    this.keyrings.push(keyring);

    const vault = await this.persistAllKeyrings(password);
    return {
      accounts,
      vault,
    };
  }

  // 키링 배열을 직렬화하고 사용자가 입력한 password로 암호화하여 저장소에 저장
  persistAllKeyrings(password) {
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
    )
      .then((serializedKeyrings) => {
        return encryptor.encrypt(this.password, serializedKeyrings);
      })
      .then((encryptedString) => {
        return encryptedString;
      });
  }

  // 키링 clear
  async clearKeyrings() {
    // clear keyrings from memory
    this.keyrings = [];
    // this.memStore.updateState({
    //   keyrings: [],
    // });
  }

  async getAccounts() {
    const keyrings = this.keyrings || [];
    const addrs = await Promise.all(
      keyrings.map((kr) => kr.getAccounts()),
    ).then((keyringArrays) => {
      return keyringArrays.reduce((res, arr) => {
        return res.concat(arr);
      }, []);
    });
    return addrs.map(normalize);
  }

  // 중복체크
  checkForDuplicate(type, newAccountArray) {
    return this.getAccounts().then((accounts) => {
      switch (type) {
        case KEYRINGS_TYPE_MAP.SIMPLE_KEYRING: {
          const isIncluded = Boolean(
            accounts.find(
              (key) =>
                key === newAccountArray[0] ||
                key === stripHexPrefix(newAccountArray[0]),
            ),
          );
          return isIncluded
            ? Promise.reject(
                new Error(
                  "The account you're are trying to import is a duplicate",
                ),
              )
            : Promise.resolve(newAccountArray);
        }
        default: {
          return Promise.resolve(newAccountArray);
        }
      }
    });
  }

  // 비밀번호 검증 (vault)
  async verifyPassword(password) {
    const { vault: encryptedVault } = await this.store.get('vault');
    console.warn('vault => ', encryptedVault);
    if (!encryptedVault) {
      throw new Error('Cannot unlock without a previous vault.');
    }
    const verifyResult = await encryptor.decrypt(password, encryptedVault);
    return verifyResult;
  }

  // 계정 PrivateKey / PublicKey 추출
  async exportKey({ address, keyType }) {
    try {
      const keyring = await this.getKeyringForAccount(address);
      return keyring.exportKey({
        address: normalize(address),
        keyType,
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }

  /**
   * Get Keyring For Account
   *
   * Returns the currently initialized keyring that manages
   * the specified `address` if one exists.
   *
   * @param {string} address - An account address.
   * @returns {Promise<Keyring>} The keyring of the account, if it exists.
   */
  getKeyringForAccount(address) {
    const hexed = normalize(address);

    return Promise.all(
      this.keyrings.map((keyring) => {
        return Promise.all([keyring, keyring.getAccounts()]);
      }),
    ).then((candidates) => {
      const winners = candidates.filter((candidate) => {
        const accounts = candidate[1].map(normalize);
        return accounts.includes(hexed);
      });
      if (winners && winners.length > 0) {
        return winners[0][0];
      }

      // Adding more info to the error
      let errorInfo = '';
      if (!address) {
        errorInfo = 'The address passed in is invalid/empty';
      } else if (!candidates || !candidates.length) {
        errorInfo = 'There are no keyrings';
      } else if (!winners || !winners.length) {
        errorInfo = 'There are keyrings, but none match the address';
      }
      throw new Error(
        `No keyring found for the requested account. Error info: ${errorInfo}`,
      );
    });
  }
}

export default KeyringController;
