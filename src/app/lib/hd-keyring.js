import { hdkey } from 'ethereumjs-wallet';

import SimpleKeyring from './simple-keyring';
import { normalize } from './util';

// commonJS 방식으로 안하면 빌드 오류 발생...
const bip39 = require('bip39');

// 이더리움 HD 지갑 전용 path
const hdPathString = `m/44'/60'/0'/0`;
const type = 'HD Key Tree';

class HdKeyring extends SimpleKeyring {
  constructor(opts = {}) {
    super();
    this.type = type;
    this.deserialize(opts);
  }

  serialize() {
    const mnemonicAsBuffer =
      typeof this.opts.mnemonic === 'string'
        ? Buffer.from(this.opts.mnemonic, 'utf8')
        : this.opts.mnemonic;
    return Promise.resolve({
      mnemonic: Array.from(mnemonicAsBuffer.values()),
      numberOfAccounts: this.wallets.length,
      hdPath: this.hdPath,
    });
  }

  deserialize(opts = {}) {
    if (opts.numberOfAccounts && !opts.mnemonic) {
      throw new Error(
        'Eth-Hd-Keyring: Deserialize method cannot be called with an opts value for numberOfAccounts and no menmonic',
      );
    }

    if (this.root) {
      throw new Error(
        'Eth-Hd-Keyring: Secret recovery phrase already provided',
      );
    }
    this.opts = opts;
    this.wallets = [];
    this.mnemonic = null;
    this.root = null;
    this.hdPath = opts.hdPath || hdPathString;

    if (opts.mnemonic) {
      this.initFromAccount(this.initFromMnemonic(opts.mnemonic));
    }
    return Promise.resolve([]);
  }

  /**
   * 현재 로그인 되어있는 Account의 Vault안의 니모닉 코드를 반환.
   *
   * @returns {string} mnemonic - A seed phrase represented
   */
  getMnemonicCode() {
    if (this.mnemonic) {
      return this.mnemonic;
    } else {
      const mnemonicAsString =
        typeof this.opts.mnemonic === 'string'
          ? this.opts.mnemonic
          : Buffer.from(this.opts.mnemonic, 'utf8').toString();
      return mnemonicAsString;
    }
  }

  // 랜덤 니모닉 생성
  generateRandomMnemonic() {
    return this.initFromMnemonic(bip39.generateMnemonic());
  }

  // 니모닉 검증
  validateMnemonic(mnemonic) {
    // validate before initializing
    const isValid = bip39.validateMnemonic(mnemonic);
    if (!isValid) {
      throw new Error(
        'Eth-Hd-Keyring: Invalid secret recovery phrase provided',
      );
    }
    return isValid;
  }

  /**
   * Sets appropriate properties for the keyring based on the given
   * BIP39-compliant mnemonic.
   *
   * @param {string} mnemonic - A seed phrase represented
   * as a string. Mnemonic input passed as type buffer or array of UTF-8 bytes must be NFKD normalized.
   */
  initFromMnemonic(mnemonic) {
    // 니모닉 return 전에 체크할거 체크 (root 여부, validate)
    if (this.root) {
      throw new Error(
        'Eth-Hd-Keyring: Secret recovery phrase already provided',
      );
    }
    if (typeof mnemonic !== 'string') {
      this.mnemonic = Buffer.from(mnemonic, 'utf8').toString();
    } else if (Array.isArray(mnemonic)) {
      this.mnemonic = Buffer.from(mnemonic).toString();
    } else {
      this.mnemonic = mnemonic;
    }
    // validate before initializing
    const isValid = this.validateMnemonic(this.mnemonic);
    if (!isValid) {
      throw new Error(
        'Eth-Hd-Keyring: Invalid secret recovery phrase provided',
      );
    }
    return this.mnemonic;
  }

  // create account init
  async initFromAccount(mnemonic) {
    if (this.root) {
      throw new Error(
        'Eth-Hd-Keyring: Secret recovery phrase already provided',
      );
    }

    const seed = bip39.mnemonicToSeedSync(mnemonic);
    this.hdWallet = hdkey.fromMasterSeed(seed);
    this.root = this.hdWallet.derivePath(this.hdPath);

    // 계정 추가
    if (this.opts.numberOfAccounts) {
      const accounts = await this.addAccounts(this.opts.numberOfAccounts);
      return accounts;
    }
  }

  addAccounts(numberOfAccounts = 1) {
    if (!this.root) {
      throw new Error('Eth-Hd-Keyring: No secret recovery phrase provided');
    }

    const oldLen = this.wallets.length;
    const newWallets = [];
    for (let i = oldLen; i < numberOfAccounts + oldLen; i += 1) {
      const child = this.root.deriveChild(i);
      const wallet = child.getWallet();
      newWallets.push(wallet);
      this.wallets.push(wallet);
    }
    const hexWallets = newWallets.map((w) => {
      return normalize(w.getAddress().toString('hex'));
    });
    return Promise.resolve(hexWallets);
  }

  getAccounts() {
    return Promise.resolve(
      this.wallets.map((w) => {
        return normalize(w.getAddress().toString('hex'));
      }),
    );
  }
}

HdKeyring.type = type;
export default HdKeyring;
