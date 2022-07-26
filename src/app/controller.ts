import ExtensionStore from './lib/localstore';

class Controller {
  public store: any;

  constructor() {
    this.store = new ExtensionStore();
  }
}

export default Controller;
