import KeyringController from './controllers/keyring-controller';
import ExtensionStore from './lib/localstore';

class Controller {
  constructor() {
    this.store = new ExtensionStore();

    this.keyringController = new KeyringController({
      store: this.store,
    });
  }
}

export default Controller;
