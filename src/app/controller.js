import KeyringController from './controllers/keyring-controller';
import ProviderController from './controllers/provider-controller';
import ExtensionStore from './lib/localstore';

class Controller {
  constructor() {
    this.store = new ExtensionStore();

    this.keyringController = new KeyringController({
      store: this.store,
    });
    this.providerController = new ProviderController({
      store: this.store,
      infuraProjectId: process.env.INFURA_PROJECT_ID,
    });
    this.providerController.initializeProvider();
  }

  getLatestBlock = async () => {
    const block = await this.providerController.getLatestBlock();
    return {
      block,
    };
  };

  getNetworkId = async () => {
    const networkId = await this.providerController.getNetworkId();
    return {
      networkId,
    };
  };

  setRpcTarget = (_, { rpcUrl, chainId }) => {
    return Promise.resolve(
      this.providerController.setRpcTarget(rpcUrl, chainId),
    );
  };

  setProviderType = (_, { chainId }) => {
    return Promise.resolve(this.providerController.setProviderType(chainId));
  };

  getCurrentChainId = async () => {
    const chainId = await this.providerController.getCurrentChainId();
    return {
      chainId,
    };
  };
}

export default Controller;
