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
    this.deserialize(opts);
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

  // 니모닉 return 전에 체크할거 체크 (root 여부, validate)
  initFromMnemonic(mnemonic) {
    if (this.root) {
      throw new Error(
        'Eth-Hd-Keyring: Secret recovery phrase already provided',
      );
    }
    // validate before initializing
    const isValid = bip39.validateMnemonic(mnemonic);
    if (!isValid) {
      throw new Error(
        'Eth-Hd-Keyring: Invalid secret recovery phrase provided',
      );
    }
    return mnemonic;
  }

  // create account init
  async initFromAccount(mnemonic) {
    if (this.root) {
      throw new Error(
        'Eth-Hd-Keyring: Secret recovery phrase already provided',
      );
    }

    const seed = bip39.mnemonicToSeedSync(mnemonic);
    console.log('HD Keyring : ', seed);
    this.hdWallet = hdkey.fromMasterSeed(seed);
    console.log('HD Keyring hdWallet : ', this.hdWallet);
    this.root = this.hdWallet.derivePath(this.hdPath);
    console.log('HD Keyring root : ', this.root);

    // 계정 추가
    const accounts = await this.addAccounts();
    return accounts;
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
