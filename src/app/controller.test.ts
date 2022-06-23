import MetamaskController from './controller';
import { NETWORK_TYPE_RPC } from '../../shared/constants/network';
import { cloneDeep } from 'lodash';
import sinon from 'sinon';

const NOTIFICATION_ID = 'NHL8f2eSSTn9TKBamRLiU';
const TEST_SEED =
  'debris dizzy just program just float decrease vacant alarm reduce speak stadium';
const firstTimeState = {
  config: {},
  NetworkController: {
    provider: {
      type: NETWORK_TYPE_RPC,
      rpcUrl: 'http://localhost:8545',
      chainId: '0x539',
    },
    networkDetails: {
      EIPS: {
        1559: false,
      },
    },
  },
  NotificationController: {
    notifications: {
      [NOTIFICATION_ID]: {
        id: NOTIFICATION_ID,
        origin: 'local:http://localhost:8086/',
        createdDate: 1652967897732,
        readDate: null,
        message: 'Hello, http://localhost:8086!',
      },
    },
  },
};

const browserPolyfillMock = {
  runtime: {
    id: 'fake-extension-id',
    onInstalled: {
      addListener: () => undefined,
    },
    onMessageExternal: {
      addListener: () => undefined,
    },
    getPlatformInfo: async () => 'mac',
  },
};

describe('controller', () => {
  let metamaskController: any;
  const sandbox = sinon.createSandbox();

  beforeEach(async () => {
    metamaskController = new MetamaskController({
      encryptor: {
        encrypt(_: any, object: any) {
          this.object = object;
          return Promise.resolve('mock-encrypted');
        },
        decrypt() {
          return Promise.resolve(this.object);
        },
      },
      initState: cloneDeep(firstTimeState),
      platform: {
        showTransactionNotification: () => undefined,
        getVersion: () => 'foo',
      },
      browser: browserPolyfillMock,
      initLangCode: 'ko',
      infuraProjectId: 'foo',
    });

    // add sinon method spies
    sandbox.spy(
      metamaskController.keyringController,
      'createNewVaultAndKeychain',
    );
    sandbox.spy(
      metamaskController.keyringController,
      'createNewVaultAndRestore',
    );
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#getAccounts', function () {
    it('returns first address when dapp calls web3.eth.getAccounts', async function () {
      const password = 'a-fake-password';
      const vault =
        await metamaskController.keyringController.createNewVaultAndRestore(
          password,
          TEST_SEED,
        );
      console.log('vault', vault);
    });
  });

  describe('#importAccountWithStrategy', () => {
    const importPrivkey =
      '4cfd3e90fc78b0f86bf7524722150bb8da9c60cd532564d7ff43f5716514f553';

    beforeEach(async function () {
      const password = 'a-fake-password';
      await metamaskController.createNewVaultAndRestore(password, TEST_SEED);
      await metamaskController.importAccountWithStrategy('Private Key', [
        importPrivkey,
      ]);
    });
  });
});
