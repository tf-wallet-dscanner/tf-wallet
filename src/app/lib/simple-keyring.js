import ethUtil from 'ethereumjs-util';
import Wallet from 'ethereumjs-wallet';
import EventEmitter from 'events';

import { normalize } from './util';

const type = 'Simple Key Pair';

class SimpleKeyring extends EventEmitter {
  constructor(opts) {
    super();
    this.type = type;
    this.wallets = [];
    this.deserialize(opts);
  }

  serialize() {
    return Promise.resolve(
      this.wallets.map((w) => w.getPrivateKey().toString('hex')),
    );
  }

  deserialize(privateKeys = []) {
    return new Promise((resolve, reject) => {
      try {
        this.wallets = privateKeys.map((privateKey) => {
          const stripped = ethUtil.stripHexPrefix(privateKey);
          const buffer = Buffer.from(stripped, 'hex');
          const wallet = Wallet.fromPrivateKey(buffer);
          return wallet;
        });
      } catch (e) {
        reject(e);
      }
      resolve();
    });
  }

  addAccounts(n = 1) {
    const newWallets = [];
    for (let i = 0; i < n; i += 1) {
      newWallets.push(Wallet.generate());
    }
    this.wallets = this.wallets.concat(newWallets);
    const hexWallets = newWallets.map((w) =>
      ethUtil.bufferToHex(w.getAddress()),
    );
    return Promise.resolve(hexWallets);
  }

  getAccounts() {
    return Promise.resolve(
      this.wallets.map((w) => ethUtil.bufferToHex(w.getAddress())),
    );
  }

  getPrivateKeyFor(address, opts = {}) {
    if (!address) {
      throw new Error('Must specify address.');
    }
    const wallet = this._getWalletForAccount(address, opts);
    const privKey = ethUtil.toBuffer(wallet.getPrivateKey());
    return privKey;
  }

  /**
   * @private
   */
  _getWalletForAccount(account, opts = {}) {
    const address = normalize(account);
    let wallet = this.wallets.find(
      (w) => ethUtil.bufferToHex(w.getAddress()) === address,
    );
    if (!wallet) {
      throw new Error('Simple Keyring - Unable to find matching address.');
    }

    if (opts.withAppKeyOrigin) {
      const privKey = wallet.getPrivateKey();
      const appKeyOriginBuffer = Buffer.from(opts.withAppKeyOrigin, 'utf8');
      const appKeyBuffer = Buffer.concat([privKey, appKeyOriginBuffer]);
      const appKeyPrivKey = ethUtil.keccak(appKeyBuffer, 256);
      wallet = Wallet.fromPrivateKey(appKeyPrivKey);
    }

    return wallet;
  }
}

SimpleKeyring.type = type;
export default SimpleKeyring;
