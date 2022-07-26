import { Runtime, browser } from 'webextension-polyfill-ts';

import Controller from './controller';
import { BackgroundMessages, ContentScriptMessages } from './messages';
import Messenger from './messenger';
import { IMessage, MessageListener } from './types';

const initApp = async (remotePort: Runtime.Port) => {
  console.log('remotePort: ', remotePort);
};

browser.runtime.onConnect.addListener(initApp);

class Background {
  public controller: any;

  private requests: any;

  constructor() {
    this.controller = new Controller();
    this.requests = new Map<BackgroundMessages, MessageListener>();
  }

  async receiveHello(sender: Runtime.MessageSender, data: IMessage<any>) {
    console.log('receiveHello: ', data);
    return {
      message: 'Hey there!!!',
    };
  }

  async receiveSetAddress(sender: Runtime.MessageSender, data: IMessage<any>) {
    console.log('receiveSetAddress: ', data);
    await this.controller.store.set({ address: data });
    console.log('storeGet', await this.controller.store.get('address'));
    return {
      message: 'Hey there',
    };
  }

  async sayHelloToContentScript(tabID: number) {
    await Messenger.sendMessageToContentScript(
      tabID,
      ContentScriptMessages.SAY_HELLO_TO_CS,
      { message: 'Hello from BG!!!' },
    );
  }

  async sayByeToContentScript(tabID: number) {
    await Messenger.sendMessageToContentScript(
      tabID,
      ContentScriptMessages.SAY_BYE_TO_CS,
      { message: 'Bye from BG!!!' },
    );
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
  }

  listenForMessages() {
    browser.runtime.onMessage.addListener((message, sender) => {
      const { type, data } = message;
      return this.requests.get(type)?.(sender, data);
    });
  }

  async init() {
    // 1. Create a mapping for message listeners
    this.registerMessengerRequests();

    // 2. Listen for messages from background and run the listener from the map
    this.listenForMessages();

    // Send message to content script of active tab after 1000 ms
    setInterval(() => {
      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        tabs.forEach((tab: any) => {
          console.log('tab.id:', tab.id);
          //this.sayHelloToContentScript(tab.id);
        });
      });
    }, 5000);
  }
}

const bg = new Background();
bg.init();
