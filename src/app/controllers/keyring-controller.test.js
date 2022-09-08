import MockStore from 'app/mocks/MockStore';
import mockEncryptor from 'app/mocks/mock-encryptor';
import { strict as assert } from 'assert';
import { addHexPrefix, bufferToHex, pubToAddress } from 'ethereumjs-util';
import { isAddress } from 'web3-utils';

import KeyringController from './keyring-controller';

describe('KeyringController', () => {
  const store = new MockStore();

  let keyringController;

  // your keyring something data
  const defaultKeyringConfig = {
    mnemonic: 'something mnemonic seed',
    password: 'something password',
    address: 'somthing address',
    privateKey: 'something private key',
    publicKey: 'something public key',
  };

  let newMnemonic = '';

  beforeEach(async () => {
    keyringController = new KeyringController({
      store,
      encryptor: mockEncryptor,
    });
  });

  // Mnemonic generate and validate
  describe('Generate Mnemonic', () => {
    it('make new mnemonic seed and must be a valid seed syntax', async () => {
      let validate = false;
      newMnemonic = await keyringController.generateMnemonic();
      if (newMnemonic) {
        validate = await keyringController.validateMnemonic(newMnemonic);
      }
      expect(validate).toEqual(true);
    });
  });

  // create new account
  describe('Create Account', () => {
    it('You need to extract the account address with mnemonic and password', async () => {
      const accountAddress = await keyringController.createNewAccount({
        password: defaultKeyringConfig.password,
        mnemonic: newMnemonic,
      });

      const isValid = await isAddress(accountAddress[0]);
      expect(isValid).toEqual(true);
    });
  });

  // account recovery
  describe('Recovery Account', () => {
    it('I need to recover my account address with my mnemonic and new password', async () => {
      const recoveryAddress = await keyringController.createNewVaultAndRestore({
        password: defaultKeyringConfig.password,
        mnemonic: defaultKeyringConfig.mnemonic,
      });
      expect(recoveryAddress[0]).toEqual(
        defaultKeyringConfig.address.toLowerCase(),
      );
    });
  });

  // private key export
  describe('Export Private Key', () => {
    beforeEach(async () => {
      await keyringController.createNewVaultAndRestore({
        password: defaultKeyringConfig.password,
        mnemonic: defaultKeyringConfig.mnemonic,
      });
    });

    it('Private key must be extracted with address value and password value', async () => {
      const accountPrivateKey = await keyringController.exportKey({
        keyType: 'private',
        address: defaultKeyringConfig.address,
      });
      expect(accountPrivateKey).toEqual(
        defaultKeyringConfig.privateKey.toLowerCase(),
      );
    });
  });

  // public key export
  describe('Export Public Key', () => {
    beforeEach(async () => {
      await keyringController.createNewVaultAndRestore({
        password: defaultKeyringConfig.password,
        mnemonic: defaultKeyringConfig.mnemonic,
      });
    });

    it('Public key must be extracted with address value and password value', async () => {
      const accountPublicKey = await keyringController.exportKey({
        keyType: 'public',
        address: defaultKeyringConfig.address,
      });
      expect(accountPublicKey).toEqual(
        defaultKeyringConfig.publicKey.toLowerCase(),
      );
    });
  });

  // account import for private key
  describe('importAccountWithStrategy', () => {
    beforeEach(async () => {
      await keyringController.importAccountStrategy({
        strategy: 'Private Key',
        args: {
          password: defaultKeyringConfig.password,
          privateKey: defaultKeyringConfig.privateKey,
        },
      });
    });

    it('adds private key to keyrings in KeyringController', async () => {
      const simpleKeyrings =
        keyringController.getKeyringsByType('Simple Key Pair');
      const privKeyBuffer = simpleKeyrings[0].wallets[0].privateKey;
      const pubKeyBuffer = simpleKeyrings[0].wallets[0].publicKey;
      const addressBuffer = pubToAddress(pubKeyBuffer);
      const privKey = bufferToHex(privKeyBuffer);
      const pubKey = bufferToHex(addressBuffer);
      assert.equal(privKey, addHexPrefix(defaultKeyringConfig.privateKey));
      assert.equal(pubKey, defaultKeyringConfig.address.toLowerCase());
    });

    it('adds 1 account', async () => {
      const keyringAccounts = await keyringController.getAccounts();
      assert.equal(
        keyringAccounts[keyringAccounts.length - 1],
        defaultKeyringConfig.address.toLowerCase(),
      );
    });
  });
});
