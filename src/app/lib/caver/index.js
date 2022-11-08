import { keccak256 } from 'eth-lib/lib/hash';
import { BN, hexToBytes } from 'ethereumjs-util';
import _ from 'lodash';
import { syncScrypt } from 'scrypt-js';
import { v4 } from 'uuid';

const cryp = require('crypto-browserify');

/**
 * Hashes values to a sha3 hash using keccak 256
 *
 * To hash a HEX string the hex must have 0x in front.
 *
 * @return {String} the sha3 string
 */
const SHA3_NULL_S =
  '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470';

/**
 * Checks if a given string is a HEX string.
 * Difference to {@link module:utils~isHex|caver.utils.isHex} is that it expects HEX to be prefixed with `0x`.
 *
 * @example
 * const result = caver.utils.isHexStrict('0xc1912') // true
 * const result = caver.utils.isHexStrict('c1912') // false
 * const result = caver.utils.isHexStrict('Hello') // false
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} hex The given HEX string.
 * @returns {boolean} `true` if a given string is a HEX string.
 */
const isHexStrict = (hex) => {
  return (_.isString(hex) || _.isNumber(hex)) && /^(-)?0x[0-9a-f]*$/i.test(hex);
};

/**
 * Calculates the sha3 of the input.
 *
 * @example
 * const hash = caver.utils.sha3('234')
 *
 * @memberof module:utils
 * @inner
 *
 * @param {string} str - A string to hash.
 * @return {string} The result hash.
 */
const sha3 = (value) => {
  // return null when value is not string type.
  if (typeof value === 'number') return null;

  if (isHexStrict(value) && /^0x/i.test(value.toString())) {
    value = hexToBytes(value);
  }

  if (BN.isBN(value)) {
    value = value.toString(10);
  }

  const returnValue = keccak256(value);

  if (returnValue === SHA3_NULL_S) {
    return null;
  }
  return returnValue;
};

export const decryptKey = (encryptedArray, password) => {
  if (!encryptedArray || encryptedArray.length === 0) return undefined;

  const decryptedArray = [];
  for (const encrypted of encryptedArray) {
    let derivedKey;
    let kdfparams;
    /**
     * Supported kdf modules are the following:
     * 1) pbkdf2
     * 2) scrypt
     */
    if (encrypted.kdf === 'scrypt') {
      kdfparams = encrypted.kdfparams;

      // FIXME: support progress reporting callback
      derivedKey = syncScrypt(
        Buffer.from(password),
        Buffer.from(kdfparams.salt, 'hex'),
        kdfparams.n,
        kdfparams.r,
        kdfparams.p,
        kdfparams.dklen,
      );
    } else if (encrypted.kdf === 'pbkdf2') {
      kdfparams = encrypted.kdfparams;

      if (kdfparams.prf !== 'hmac-sha256') {
        throw new Error('Unsupported parameters to PBKDF2');
      }

      derivedKey = cryp.pbkdf2Sync(
        Buffer.from(password),
        Buffer.from(kdfparams.salt, 'hex'),
        kdfparams.c,
        kdfparams.dklen,
        'sha256',
      );
    } else {
      throw new Error('Unsupported key derivation scheme');
    }

    const ciphertext = Buffer.from(encrypted.ciphertext, 'hex');

    const mac = sha3(
      Buffer.from([...derivedKey.slice(16, 32), ...ciphertext]),
    ).replace('0x', '');
    if (mac !== encrypted.mac) {
      throw new Error('Key derivation failed - possibly wrong password');
    }

    const decipher = cryp.createDecipheriv(
      encrypted.cipher,
      derivedKey.slice(0, 16),
      Buffer.from(encrypted.cipherparams.iv, 'hex'),
    );
    decryptedArray.push(
      `0x${Buffer.from([
        ...decipher.update(ciphertext),
        ...decipher.final(),
      ]).toString('hex')}`,
    );
  }
  return decryptedArray;
};

/**
 * Decrypts a keystore V4 JSON
 * @param {JSON} keystoreJson The keystore v4 JSON File to decrypt.
 * @param {string} password The password used for encryption.
 */
export function decryptV4(keystoreJson, password) {
  let decrypted = decryptKey(keystoreJson.keyring, password);
  decrypted = _.isArray(decrypted) ? decrypted : [decrypted];
  return {
    address: keystoreJson.address,
    privateKey: decrypted[0],
  };
}

const encryptKey = (privateKey, password) => {
  const encryptedArray = [];
  if (!privateKey) return encryptedArray;

  const privateKeyArray = _.isArray(privateKey) ? privateKey : [privateKey];

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < privateKeyArray.length; i++) {
    const salt = cryp.randomBytes(32);
    const iv = cryp.randomBytes(16);

    let derivedKey = null;
    const kdf = 'scrypt';
    const kdfparams = {
      dklen: 32,
      salt: salt.toString('hex'),
      n: 4096, // 2048 4096 8192 16384
      r: 8,
      p: 1,
    };

    // eslint-disable-next-line no-const-assign
    derivedKey = syncScrypt(
      Buffer.from(password),
      Buffer.from(kdfparams.salt, 'hex'),
      kdfparams.n,
      kdfparams.r,
      kdfparams.p,
      kdfparams.dklen,
    );

    const cipher = cryp.createCipheriv(
      'aes-128-ctr',
      derivedKey.slice(0, 16),
      iv,
    );
    if (!cipher) {
      throw new Error('Unsupported cipher');
    }

    const ciphertext = Buffer.from([
      ...cipher.update(
        Buffer.from(privateKeyArray[i].replace('0x', ''), 'hex'),
      ),
      ...cipher.final(),
    ]);

    const mac = sha3(
      Buffer.from([...derivedKey.slice(16, 32), ...ciphertext]),
    ).replace('0x', '');

    encryptedArray.push({
      ciphertext: ciphertext.toString('hex'),
      cipherparams: {
        iv: iv.toString('hex'),
      },
      cipher: 'aes-128-ctr',
      kdf,
      kdfparams,
      mac: mac.toString('hex'),
    });
  }

  return encryptedArray;
};

/**
 * Encrypts a keyring and returns a keystore v4 standard.
 * For more information, please refer to {@link https://kips.klaytn.com/KIPs/kip-3|KIP-3}.
 * @param {string} password The password to be used for encryption. The encrypted key store can be decrypted with this password.
 * @param {object} [options] The options parameter allows you to specify the values to use when using encrypt.
 * @return {KeyringFactory.Keystore} The encrypted keystore v4.
 */
export function encryptKeystoreV4({ address, privateKey, password }) {
  let keyring = [];
  keyring = encryptKey(privateKey, password);

  return {
    version: 4,
    id: v4({ random: cryp.randomBytes(16) }),
    address: address.toLowerCase(),
    keyring,
  };
}
