import accountImporter from 'app/lib/account-importer';
import HdKeyring from 'app/lib/hd-keyring';
import SimpleKeyring from 'app/lib/simple-keyring';
import { normalize, stripHexPrefix } from 'app/lib/util';
import Web3Query from 'app/lib/web3-query';
import encryptor from 'browser-passworder';

const bip39 = require('bip39');

const keyringTypes = [SimpleKeyring, HdKeyring];

const KEYRINGS_TYPE_MAP = {
  HD_KEYRING: 'HD Key Tree',
  SIMPLE_KEYRING: 'Simple Key Pair',
};

class KeyringController {
  #keyringStore; // store

  #password; // password 정보

  constructor(opts = {}) {
    this.encryptor = opts.encryptor || encryptor;
    this.keyrings = [];
    this.#keyringStore = opts.store;
    this.ethQuery = opts.ethQuery;
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

  // store vault update
  async storeUpdateVault(password) {
    const vault = await this.persistAllKeyrings(password);
    this.#setKeyringConfig({ vault });
  }

  // 신규 니모닉 얻기
  async getNewMnemonic() {
    this.hdKeyring = new HdKeyring();
    const mnemonic = await this.hdKeyring.generateRandomMnemonic();
    return mnemonic;
  }

  // 니모닉 검증
  getMnemonicValidate(mnemonic) {
    this.hdKeyring = new HdKeyring();
    const validate = this.hdKeyring.validateMnemonic(mnemonic);
    return validate;
  }

  // 신규 계정 생성
  async createNewAccount({ password, mnemonic }) {
    this.#password = password;

    this.hdKeyring = new HdKeyring();
    const isValid = this.hdKeyring.validateMnemonic(mnemonic);

    if (isValid) {
      const accounts = await this.hdKeyring.initFromAccount(mnemonic);
      this.keyrings.push(this.hdKeyring);
      await this.storeUpdateVault(password);
      await this.addStoreAccounts(accounts[0]);
      return accounts;
    }

    return null;
  }

  // 계정 복구
  async createNewVaultAndRestore({ password, mnemonic }) {
    this.#password = password;

    // 니모닉 단어 리스트 검증
    const wordlists = Object.values(bip39.wordlists);
    if (
      wordlists.every((wordlist) => !bip39.validateMnemonic(mnemonic, wordlist))
    ) {
      return Promise.reject(new Error('Seed phrase is invalid.'));
    }

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
    await this.storeUpdateVault(password);
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
    const encryptedString = await this.encryptor.encrypt(
      this.#password,
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
    const verifyResult = await this.encryptor.decrypt(password, encryptedVault);
    return verifyResult;
  }

  // 계정 PrivateKey / PublicKey 추출
  async getExportKey({ address, keyType }) {
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

  // keystore json -> private key 추출
  async getKeystoreToPrivKey({ fileContents, password }) {
    this.#password = password;
    const privateKey = await accountImporter.importAccount('JSON File', {
      fileContents,
      password,
    });
    return privateKey;
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
   * store에 저장된 rpcUrl 가져와서 Web3Query를 통해 web3.eth 접근
   * @param {string} privateKey 사용자가 설정한 비공개키
   * @param {string} password 사용자 패스워드
   * @returns {Object} keystore v3 JSON
   */
  async getExportKeystoreV3({ privateKey, password }) {
    const { rpcUrl } = await this.keyringConfig;
    const web3Query = new Web3Query(rpcUrl);
    return web3Query.getAccountsEncrypt({ privateKey, password });
  }

  /**
   * 계정 가져오기
   * @param {string} strategy - import 유형 (Private Key, JSON File)
   * @param {Object} args - { password: 비밀번호, privateKey || fileContents: 타입에 따라 비공개 키 or JSON File }
   * @returns {string} accounts[0] - 계정 address 주소
   */
  async getImportAccountStrategy({ strategy, args }) {
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
        return this.storeUpdateVault();
      })
      .then(async () => {
        const accounts = await keyring.getAccounts();

        // store에 account address 추가
        await this.addStoreAccounts(accounts[0]);
        return accounts[0];
      });
  }

  // store에서 accounts 정보 가져오기
  async getStoreAccounts() {
    const storeAccounts = await this.#keyringStore.get('accounts');
    // storeAccounts 그대로 return하면 undefined 형태인데 undefined 형태로 return하면 ui에서 properties 관련 오류로 인해 null로 return 처리함
    return storeAccounts?.accounts ?? null;
  }

  // store add address
  async addStoreAccounts(address) {
    const accounts = await this.getStoreAccounts();

    // skip if already exists
    if (
      accounts &&
      accounts.identities &&
      accounts.identities.find((account) => account.address === address)
    ) {
      console.log('skip if already exists');
      return;
    }

    const identities =
      !accounts || !accounts.identities ? [] : accounts.identities;
    const balance = await this.updateGetBalance(address);

    // add address data
    identities.push({
      address,
      name: `Account ${identities.length + 1}`,
      balance,
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
  async updateStoreSelectedAddress(address) {
    const accounts = await this.getStoreAccounts();
    const selectedAddress = address ?? accounts?.selectedAddress;

    // lastSelected time update
    const selectedIdx =
      accounts && accounts.identities
        ? accounts.identities.findIndex(
            (identy) => identy.address === selectedAddress,
          )
        : 0;
    if (accounts && accounts.identities[selectedIdx]) {
      accounts.identities[selectedIdx].lastSelected = new Date().getTime();
      accounts.identities[selectedIdx].balance = await this.updateGetBalance(
        selectedAddress,
      );
    }

    this.#setKeyringConfig({
      accounts: {
        identities: accounts?.identities,
        selectedAddress,
      },
    });
  }

  async updateGetBalance(address) {
    const accounts = await this.getStoreAccounts();
    const currentBalance = await this.ethQuery(
      'eth_getBalance',
      address ?? accounts.selectedAddress,
      'latest',
    );
    return currentBalance;
  }

  /**
   * Get Keyring Class For Type
   *
   * Searches the current `keyringTypes` array
   * for a Keyring class whose unique `type` property
   * matches the provided `type`,
   * returning it if it exists.
   *
   * @param {string} type - The type whose class to get.
   * @returns {Keyring|undefined} The class, if it exists.
   */
  getKeyringClassForType(type) {
    return keyringTypes.find((kr) => kr.type === type);
  }

  /**
   * Get Keyrings by Type
   *
   * Gets all keyrings of the given type.
   *
   * @param {string} type - The keyring types to retrieve.
   * @returns {Array<Keyring>} The keyrings.
   */
  getKeyringsByType(type) {
    return this.keyrings.filter((keyring) => keyring.type === type);
  }

  //
  // SIGNING METHODS
  //

  /**
   * Sign Ethereum Transaction
   *
   * Signs an Ethereum transaction object.
   *
   * @param {Object} ethTx - The transaction to sign.
   * @param {string} _fromAddress - The transaction 'from' address.
   * @param {Object} opts - Signing options.
   * @returns {Promise<Object>} The signed transaction object.
   */
  async signTransaction(ethTx, _fromAddress, opts = {}) {
    const fromAddress = normalize(_fromAddress);
    const keyring = await this.getKeyringForAccount(fromAddress);
    return keyring.signTransaction(fromAddress, ethTx, opts);
  }

  // unlock keyrings
  async unlockKeyrings(password) {
    const { vault: encryptedVault } = await this.#keyringStore.get('vault');

    if (!encryptedVault) {
      throw new Error('Cannot unlock without a previous vault.');
    }

    await this.clearKeyrings();
    const vault = await this.encryptor.decrypt(password, encryptedVault);
    this.#password = password;
    await Promise.all(vault.map(this._restoreKeyring.bind(this)));
  }

  // restore keyring
  async _restoreKeyring(serialized) {
    const { type, data } = serialized;
    const Keyring = this.getKeyringClassForType(type);
    const keyring = new Keyring();
    await keyring.deserialize(data);
    // getAccounts also validates the accounts for some keyrings
    await keyring.getAccounts();
    this.keyrings.push(keyring);
    return keyring;
  }
}

export default KeyringController;
