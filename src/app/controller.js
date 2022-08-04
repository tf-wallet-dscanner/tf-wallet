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
  }

  async getLatestBlock() {
    const block = await this.providerController.getLatestBlock();
    return {
      block,
    };
  }

  async getNetworkId() {
    const networkId = await this.providerController.getNetworkId();
    return {
      networkId,
    };
  }
}

export default Controller;
