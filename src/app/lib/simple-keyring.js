import { bufferToHex, keccak, stripHexPrefix } from 'ethereumjs-util';
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
          const stripped = stripHexPrefix(privateKey);
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
    const hexWallets = newWallets.map((w) => bufferToHex(w.getAddress()));
    return Promise.resolve(hexWallets);
  }

  getAccounts() {
    return Promise.resolve(
      this.wallets.map((w) => bufferToHex(w.getAddress())),
    );
  }

  // 개인키/공개키 반환
  async exportKey({ address, keyType }, opts = {}) {
    if (!address) {
      throw new Error('Must specify address.');
    }
    const wallet = this.#getWalletForAccount(address, opts);
    const methodName = keyType === 'private' ? 'getPrivateKey' : 'getPublicKey';
    const keyValue = await wallet[methodName]().toString('hex');
    return keyValue;
  }

  /**
   * @private
   */
  #getWalletForAccount(account, opts = {}) {
    const address = normalize(account);
    let wallet = this.wallets.find(
      (w) => bufferToHex(w.getAddress()) === address,
    );
    if (!wallet) {
      throw new Error('Simple Keyring - Unable to find matching address.');
    }

    if (opts.withAppKeyOrigin) {
      const privKey = wallet.getPrivateKey();
      const appKeyOriginBuffer = Buffer.from(opts.withAppKeyOrigin, 'utf8');
      const appKeyBuffer = Buffer.concat([privKey, appKeyOriginBuffer]);
      const appKeyPrivKey = keccak(appKeyBuffer, 256);
      wallet = Wallet.fromPrivateKey(appKeyPrivKey);
    }

    return wallet;
  }
}

SimpleKeyring.type = type;
export default SimpleKeyring;
