import EthQuery from 'eth-query';
import Eth from 'ethjs';
import PortStream from 'extension-port-stream';
import log from 'loglevel';
import StreamProvider from 'web3-stream-provider';
import browser from 'webextension-polyfill';

import {
  ENVIRONMENT_TYPE_FULLSCREEN,
  ENVIRONMENT_TYPE_POPUP,
} from '../../shared/constants/app';
import launchMetaMaskUi from '../ui';
import metaRPCClientFactory from './lib/metaRPCClientFactory';
import { setupMultiplex } from './lib/stream-utils';
import { getEnvironmentType } from './lib/util';
import ExtensionPlatform from './platforms/extension';

let global: any;

async function start() {
  /**
   * Establishes a streamed connection to a Web3 provider
   *
   * @param {PortDuplexStream} connectionStream - PortStream instance establishing a background connection
   */
  function setupWeb3Connection(connectionStream: any) {
    const providerStream = new StreamProvider();
    providerStream.pipe(connectionStream).pipe(providerStream);
    connectionStream.on('error', console.error.bind(console));
    providerStream.on('error', console.error.bind(console));
    global.ethereumProvider = providerStream;
    global.ethQuery = new EthQuery(providerStream);
    global.eth = new Eth(providerStream);
  }

  /**
   * Establishes a streamed connection to the background account manager
   *
   * @param {PortDuplexStream} connectionStream - PortStream instance establishing a background connection
   * @param {Function} cb - Called when the remote account manager connection is established
   */
  function setupControllerConnection(connectionStream: any, cb: any) {
    const backgroundRPC = metaRPCClientFactory(connectionStream);
    cb(null, backgroundRPC);
  }

  /**
   * Establishes a connection to the background and a Web3 provider
   *
   * @param {PortDuplexStream} connectionStream - PortStream instance establishing a background connection
   * @param {Function} cb - Called when controller connection is established
   */
  function connectToAccountManager(connectionStream: any, cb: any) {
    const mx = setupMultiplex(connectionStream);
    setupControllerConnection(mx.createStream('controller'), cb);
    setupWeb3Connection(mx.createStream('provider'));
  }

  async function queryCurrentActiveTab(windowType: any) {
    return new Promise((resolve) => {
      // At the time of writing we only have the `activeTab` permission which means
      // that this query will only succeed in the popup context (i.e. after a "browserAction")
      if (windowType !== ENVIRONMENT_TYPE_POPUP) {
        resolve({});
        return;
      }

      browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
        const [activeTab] = tabs;
        const { id, title, url } = activeTab;
        const { origin, protocol }: any = url ? new URL(url) : {};

        if (!origin || origin === 'null') {
          resolve({});
          return;
        }

        resolve({ id, title, origin, protocol, url });
      });
    });
  }

  function initializeUi(
    activeTab: any,
    container: any,
    connectionStream: any,
    cb: any,
  ) {
    connectToAccountManager(
      connectionStream,
      (err: any, backgroundConnection: any) => {
        if (err) {
          cb(err, null);
          return;
        }

        launchMetaMaskUi(
          {
            activeTab,
            container,
            backgroundConnection,
          },
          cb,
        );
      },
    );
  }

  // create platform global
  global.platform = new ExtensionPlatform();

  // identify window type (popup, notification)
  const windowType = getEnvironmentType();

  // setup stream to background
  const extensionPort = browser.runtime.connect({ name: windowType });

  const connectionStream = new PortStream(extensionPort);

  const activeTab = await queryCurrentActiveTab(windowType);

  function initializeUiWithTab(tab: any) {
    const container = document.getElementById('app-content');
    initializeUi(tab, container, connectionStream, (err: any, store: any) => {
      if (err) {
        // if there's an error, store will be = metamaskState
        // displayCriticalError(container, err, store);
        console.log('initializeUiWithTab error:', err);
        return;
      }

      const state = store.getState();
      const { metamask: { completedOnboarding } = {} as any } = state;

      if (!completedOnboarding && windowType !== ENVIRONMENT_TYPE_FULLSCREEN) {
        global.platform.openExtensionInBrowser();
      }
    });
  }

  /**
   * In case of MV3 the issue of blank screen was very frequent, it is caused by UI initialising before background is ready to send state.
   * Code below ensures that UI is rendered only after background is ready.
   */
  extensionPort.onMessage.addListener((message) => {
    if (message?.name === 'CONNECTION_READY') {
      initializeUiWithTab(activeTab);
    }
  });
}

start().catch(log.error);
