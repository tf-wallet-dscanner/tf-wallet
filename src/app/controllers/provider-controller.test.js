import {
  GOERLI,
  GOERLI_CHAIN_ID,
  GOERLI_RPC_URL,
  MAINNET,
  MAINNET_CHAIN_ID,
  MAINNET_RPC_URL,
  NETWORK_TYPE_RPC,
} from 'app/constants/network';
import MockStore from 'app/mocks/MockStore';

import ProviderController from './provider-controller';

describe('ProviderController', () => {
  const store = new MockStore();
  const infuraProjectId = 'something key';
  const defaultProviderConfig = {
    type: MAINNET,
    rpcUrl: MAINNET_RPC_URL,
    chainId: MAINNET_CHAIN_ID,
  };
  let providerController;

  beforeEach(() => {
    providerController = new ProviderController({
      store,
      infuraProjectId,
    });
  });

  describe('initializeProvider', () => {
    it('setup default provider configs', async () => {
      await providerController.initializeProvider();
      const config = await providerController.providerConfig;
      expect(config).toEqual(defaultProviderConfig);
    });

    describe('Set infura provider', () => {
      it('provider should GOERLI network', async () => {
        providerController.setProviderType('0x5');
        const config = await providerController.providerConfig;
        expect(config).toEqual({
          type: GOERLI,
          rpcUrl: GOERLI_RPC_URL,
          chainId: GOERLI_CHAIN_ID,
        });
      });
    });

    describe('Set RPC url provider', () => {
      it('provider should localhost', async () => {
        const rpcUrl = 'http://localhost:8545';
        const chainId = '0x115';
        providerController.setRpcTarget(rpcUrl, chainId);
        const config = await providerController.providerConfig;
        expect(config).toEqual({
          type: NETWORK_TYPE_RPC,
          rpcUrl,
          chainId,
        });
      });
    });
  });
});
