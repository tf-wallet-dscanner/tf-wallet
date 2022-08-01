import browser from 'webextension-polyfill';

import Controller from './controller';
import ProviderController from './controllers/provider-controller';
import NotificationManager from './lib/notification-manager';
import { BackgroundMessages } from './messages';

const notificationManager = new NotificationManager();

/**
 * Opens the browser popup for user confirmation
 */
async function triggerUi() {
  await notificationManager.showPopup();
}

class Background {
  constructor() {
    this.controller = new Controller();
    this.providerController = new ProviderController();
    this.requests = new Map();
  }

  async receiveHello(sender, data) {
    console.log('BG: receiveHello: ', sender, data);
    return {
      message: 'Hey there!!!',
    };
  }

  async receiveSetAddress(sender, data) {
    console.log('BG: receiveSetAddress: ', sender, data);
    await this.controller.store.set({ address: data.message });
    const res = await this.controller.store.get('address');
    console.log('BG: get store', res);
    return {
      message: res,
    };
  }

  async getEthereumAccounts() {
    const accounts = await this.providerController.getAccounts();
    return {
      accounts,
    };
  }

  registerMessengerRequests() {
    this.requests.set(
      BackgroundMessages.SAY_HELLO_TO_BG,
      this.receiveHello.bind(this),
    );

    this.requests.set(
      BackgroundMessages.SET_ADDRESS_TO_BG,
      this.receiveSetAddress.bind(this),
    );

    this.requests.set(
      BackgroundMessages.GET_ACCOUNTS,
      this.getEthereumAccounts.bind(this),
    );
  }

  listenForMessages() {
    browser.runtime.onMessage.addListener(async (message, sender) => {
      const { type, data } = message;
      if (type === BackgroundMessages.INPAGE_TO_BG) {
        // 팝업 띄우기
        await triggerUi();
        return null;
      } else {
        return this.requests.get(type)?.(sender, data);
      }
    });
  }

  async init() {
    // 1. Create a mapping for message listeners
    this.registerMessengerRequests();

    // 2. Listen for messages from background and run the listener from the map
    this.listenForMessages();

    // Send message to content script of active tab after 10000 ms
    setInterval(() => {
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        tabs.forEach((tab) => {
          console.log('tab.id:', tab.id);
        });
      });
    }, 10000);
  }
}

const initApp = async (remotePort) => {
  console.log('remotePort: ', remotePort);
  new Background().init();
};

browser.runtime.onConnect.addListener(initApp);
