import { decryptV4 } from 'app/lib/caver';
import {
  addHexPrefix,
  bufferToHex,
  isValidPrivate,
  stripHexPrefix,
  toBuffer,
} from 'ethereumjs-util';
import Wallet from 'ethereumjs-wallet';
import _ from 'lodash';

// 비공개키 or JSON 파일로 계정 address 가져오기
const accountImporter = {
  /**
   * importAccount
   * @param {string} strategy - import 유형 (Private Key, JSON File)
   * @param {Object} args - { password: 비밀번호, privateKey || fileContents: 타입에 따라 비공개 키 or JSON File }
   * @returns {Promise<string>} - privateKeyHex
   */
  importAccount(strategy, args) {
    try {
      const importer = this.strategies[strategy];
      const privateKeyHex = importer(
        strategy === 'Private Key'
          ? args.privateKey
          : { input: args.fileContents, password: args.password },
      );
      return Promise.resolve(privateKeyHex);
    } catch (e) {
      return Promise.reject(e);
    }
  },
  strategies: {
    'Private Key': (privateKey) => {
      if (!privateKey) {
        throw new Error('Cannot import an empty key.');
      }
      const prefixed = addHexPrefix(privateKey);
      const buffer = toBuffer(prefixed);

      if (!isValidPrivate(buffer)) {
        throw new Error('Cannot import invalid private key.');
      }

      const stripped = stripHexPrefix(prefixed);
      return stripped;
    },
    'JSON File': async ({ input, password }) => {
      // keystore json v3, v4
      const json = _.isObject(input) ? _.cloneDeep(input) : JSON.parse(input);

      if (!json.version || (json.version !== 3 && json.version !== 4))
        throw new Error('This is not a V3 or V4 wallet.');

      if (json.version === 3 && !json.crypto) {
        throw new Error("Invalid keystore V3 format: 'crypto' is not defined.");
      } else if (json.version === 4 && !json.keyring) {
        throw new Error(
          "Invalid keystore V4 format: 'keyring' is not defined.",
        );
      }

      if (json.version === 3) {
        const wallet = await Wallet.fromV3(input, password, true);
        return bufferToHex(wallet.privateKey);
      } else {
        const result = decryptV4(json, password);
        return bufferToHex(result.privateKey);
      }
    },
  },
};

export default accountImporter;
