import EthQuery from 'app/lib/eth-query';
import HdKeyring from 'app/lib/hd-keyring';
import { normalize, stripHexPrefix } from 'app/lib/util';
import encryptor from 'browser-passworder';

const bip39 = require('bip39');

const KEYRINGS_TYPE_MAP = {
  HD_KEYRING: 'HD Key Tree',
  SIMPLE_KEYRING: 'Simple Key Pair',
};

class KeyringController {
  #keyringStore;

  constructor(opts = {}) {
    this.hdKeyring = new HdKeyring();
    this.keyrings = [];
    this.password = '';
    this.#keyringStore = opts.store;
  }

  /**
   * @returns {Promise<any>}
   */
  get keyringConfig() {
    return this.#keyringStore.getAll();
  }

  // 니모닉 생성
  async generateMnemonic() {
    const mnemonic = await this.hdKeyring.generateRandomMnemonic();
    return mnemonic;
  }

  // 니모닉 검증
  validateMnemonic(mnemonic) {
    const validate = this.hdKeyring.validateMnemonic(mnemonic);
    return validate;
  }

  // 신규 계정 생성
  createNewAccount({ password, mnemonic }) {
    this.password = password;
    const isValid = this.hdKeyring.validateMnemonic(mnemonic);

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

    // private Key 추출할때 패스워드 검증위해 vault 저장
    await this.#keyringStore.set({ vault });
    return accounts;
  }

  // 키링 배열을 직렬화하고 사용자가 입력한 password로 암호화하여 저장소에 저장
  async persistAllKeyrings(password) {
    if (typeof password !== 'string') {
      return Promise.reject(
        new Error('KeyringController - password is not a string'),
      );
    }

    this.password = password;
    const serializedKeyrings = await Promise.all(
      this.keyrings.map(async (keyring) => {
        const serializedKeyringArray = await Promise.all([
          keyring.type,
          keyring.serialize(),
        ]);
        return {
          type: serializedKeyringArray[0],
          data: serializedKeyringArray[1],
        };
      }),
    );
    const encryptedString = await encryptor.encrypt(
      this.password,
      serializedKeyrings,
    );
    return encryptedString;
  }

  // 키링 clear
  async clearKeyrings() {
    // clear keyrings from memory
    this.keyrings = [];
    // #keyringStore clear keyring
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
  async checkForDuplicate(type, newAccountArray) {
    const accounts = await this.getAccounts();
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
  }

  // 비밀번호 검증 (vault)
  async verifyPassword(password) {
    const { vault: encryptedVault } = await this.#keyringStore.get('vault');
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
  async getKeyringForAccount(address) {
    const hexed = normalize(address);

    const candidates = await Promise.all(
      this.keyrings.map((keyring) => {
        return Promise.all([keyring, keyring.getAccounts()]);
      }),
    );
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
  }

  /**
   * store에 저장된 rpcUrl 가져와서 EthQuery를 통해 web3.eth 접근
   * @param {string} privateKey 사용자가 설정한 비공개키
   * @param {string} password 사용자 패스워드
   * @returns {Object} keystore v3 JSON
   */
  async exportKeystoreV3({ privateKey, password }) {
    const { rpcUrl } = await this.keyringConfig;
    const ethQuery = new EthQuery(rpcUrl);
    return ethQuery.getAccountsEncrypt({ privateKey, password });
  }
}

export default KeyringController;
