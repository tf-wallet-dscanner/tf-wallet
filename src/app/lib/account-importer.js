import {
  addHexPrefix,
  bufferToHex,
  isValidPrivate,
  stripHexPrefix,
  toBuffer,
} from 'ethereumjs-util';
import Wallet from 'ethereumjs-wallet';

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
      const wallet = await Wallet.fromV3(input, password, true);
      return bufferToHex(wallet.privateKey);
    },
  },
};

export default accountImporter;
