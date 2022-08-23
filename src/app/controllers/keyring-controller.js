import accountImporter from 'app/lib/account-importer';
import EthQuery from 'app/lib/eth-query';
import HdKeyring from 'app/lib/hd-keyring';
import SimpleKeyring from 'app/lib/simple-keyring';
import { normalize, stripHexPrefix } from 'app/lib/util';
import encryptor from 'browser-passworder';

const bip39 = require('bip39');

const KEYRINGS_TYPE_MAP = {
  HD_KEYRING: 'HD Key Tree',
  SIMPLE_KEYRING: 'Simple Key Pair',
};

class KeyringController {
  #keyringStore; // store

  #password; // password 정보

  constructor(opts = {}) {
    this.hdKeyring = new HdKeyring();
    this.keyrings = [];
    this.#keyringStore = opts.store;
  }

  /**
   * @returns {Promise<any>}
   */
  get keyringConfig() {
    return this.#keyringStore.getAll();
  }

  /**
   * set keyring config
   * @param {Object} keyringConfig
   */
  async #setKeyringConfig(config) {
    await this.#keyringStore.set({
      ...config,
    });
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
  async createNewAccount({ password, mnemonic }) {
    this.#password = password;
    const isValid = this.hdKeyring.validateMnemonic(mnemonic);

    if (isValid) {
      const accounts = await this.hdKeyring.initFromAccount(mnemonic);
      this.keyrings.push(this.hdKeyring);
      this.persistAllKeyrings(password);
      await this.addStoreAccounts(accounts[0]);
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
    this.#setKeyringConfig({ vault });
    await this.addStoreAccounts(accounts[0]);
    return accounts;
  }

  // 키링 배열을 직렬화하고 사용자가 입력한 password로 암호화하여 저장소에 저장
  async persistAllKeyrings(password = this.#password) {
    if (typeof password !== 'string') {
      return Promise.reject(
        new Error('KeyringController - password is not a string'),
      );
    }

    this.#password = password;
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

  /**
   * 계정 가져오기
   * @param {string} strategy - import 유형 (Private Key, JSON File)
   * @param {Object} args - { password: 비밀번호, privateKey || fileContents: 타입에 따라 비공개 키 or JSON File }
   * @returns {string} accounts[0] - 계정 address 주소
   */
  async importAccountStrategy({ strategy, args }) {
    this.#password = args.password;
    const privateKey = await accountImporter.importAccount(strategy, args);

    const keyring = new SimpleKeyring([privateKey]);
    return keyring
      .getAccounts()
      .then((accounts) => {
        return this.checkForDuplicate(
          KEYRINGS_TYPE_MAP.SIMPLE_KEYRING,
          accounts,
        );
      })
      .then(() => {
        this.keyrings.push(keyring);
        return this.persistAllKeyrings();
      })
      .then(async () => {
        const accounts = await keyring.getAccounts();

        // store에 account address 추가
        await this.addStoreAccounts(accounts[0]);
        return accounts[0];

        // update accounts in preferences controller
        // const allAccounts = await this.getAccounts();
        // this.preferencesController.setAddresses(allAccounts);
        // set new account as selected
        // await this.preferencesController.setSelectedAddress(accounts[0]);
      });
  }

  // store에서 accounts 정보 가져오기
  async getStoreAccounts() {
    const storeAccounts = await this.#keyringStore.get('accounts');
    return storeAccounts?.accounts ?? null;
  }

  // store add address
  async addStoreAccounts(address) {
    const accounts = await this.getStoreAccounts();

    // skip if already exists
    if (
      accounts &&
      accounts.identities.find((account) => account.address === address)
    ) {
      console.log('skip if already exists');
      return;
    }

    const identities = !accounts ? [] : accounts.identities;

    // getBalance
    const { rpcUrl } = await this.keyringConfig;
    const ethQuery = new EthQuery(rpcUrl);
    const currentBalance = await ethQuery.getBalance(address);

    // add address data
    identities.push({
      address,
      name: `Account ${identities.length + 1}`,
      balance: currentBalance ?? '0x0',
      lastSelected: new Date().getTime(),
    });

    this.#setKeyringConfig({
      accounts: {
        identities,
        selectedAddress: address,
      },
    });
  }

  // store update selectedAddress
  async updateStoreSelectedAddress(selectedAddress) {
    const accounts = await this.getStoreAccounts();

    // lastSelected time update
    const selectedIdx = accounts.identities.findIndex(
      (identy) => identy.address === selectedAddress,
    );
    accounts.identities[selectedIdx].lastSelected = new Date().getTime();

    this.#setKeyringConfig({
      accounts: {
        identities: accounts.identities,
        selectedAddress,
      },
    });
  }
}

export default KeyringController;
