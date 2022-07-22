import PortStream from 'extension-port-stream';
import browser, { Runtime } from 'webextension-polyfill';

import MetamaskController from './controller';
import ExtensionPlatform from './platforms/extension';
import { startUi } from './ui';

const INFURA_PROJECT_ID = '00000000000';

const platform = new ExtensionPlatform();

/**
 * Initializes the MetaMask Controller with any initial state and default language.
 * Configures platform-specific error reporting strategy.
 * Streams emitted state updates to platform-specific storage strategy.
 * Creates platform listeners for new Dapps/Contexts, and sets up their data connections to the controller.
 *
 * @param {Object} initState - The initial state to start the controller with, matches the state that is emitted from the controller.
 * @param {string} initLangCode - The region code for the language preferred by the current user.
 * @param {string} remoteSourcePort - remote application port connecting to extension.
 * @returns {Promise} After setup is complete.
 */
const setupController = async (
  initState: any,
  initLangCode: string,
  remoteSourcePort: Runtime.Port,
): Promise<any> => {
  console.log('setupController', remoteSourcePort);

  const controller = new MetamaskController({
    infuraProjectId: INFURA_PROJECT_ID,
    // User confirmation callbacks:
    // showUserConfirmation: triggerUi,
    // openPopup,
    // initial state
    initState,
    // initial locale code
    initLangCode,
    // platform specific api
    platform,
    // notificationManager,
    browser,
    // getRequestAccountTabIds: () => {
    //   return requestAccountTabIds;
    // },
    // getOpenMetamaskTabsIds: () => {
    //   return openMetamaskTabsIDs;
    // },
  });
  console.log('controller', controller);

  /**
   * Connects a Port to the MetaMask controller via a multiplexed duplex stream.
   * This method identifies trusted (MetaMask) interfaces, and connects them differently from untrusted (web pages).
   *
   * @param {Port} remotePort - The port provided by a new context.
   */
  function connectRemote(remotePort: any) {
    const processName = remotePort.name;

    let isMetaMaskInternalProcess = false;
    isMetaMaskInternalProcess =
      remotePort.sender.origin === `chrome-extension://${browser.runtime.id}`;
    if (isMetaMaskInternalProcess) {
      const portStream = new PortStream(remotePort);
      console.log('BG - portStream', portStream, ',processName', processName);
      // communication with popup
      controller.isClientOpen = true;
      controller.setupTrustedCommunication(portStream, remotePort.sender);
      // Message below if captured by UI code in app/scripts/ui.js which will trigger UI initialisation
      // This ensures that UI is initialised only after background is ready
      // It fixes the issue of blank screen coming when extension is loaded, the issue is very frequent in MV3
      remotePort.postMessage({ name: 'CONNECTION_READY' });
      startUi();
      // if (processName === ENVIRONMENT_TYPE_POPUP) {
      //   popupIsOpen = true;
      //   endOfStream(portStream, () => {
      //     popupIsOpen = false;
      //     const isClientOpen = isClientOpenStatus();
      //     controller.isClientOpen = isClientOpen;
      //     onCloseEnvironmentInstances(isClientOpen, ENVIRONMENT_TYPE_POPUP);
      //   });
      // }
    }
  }

  if (remoteSourcePort) {
    connectRemote(remoteSourcePort);
  }
};

/**
 * Initializes the MetaMask controller, and sets up all platform configuration.
 *
 * @param {string} remotePort - remote application port connecting to extension.
 * @returns {Promise} Setup complete.
 */
const initialize = async (remotePort: Runtime.Port): Promise<any> => {
  /**
   * @TODO initState = await loadStateFromPersistence();
   */
  const initState = undefined;
  const initLangCode = `{ "code": "ko", "name": "한국어" }`;
  await setupController(initState, initLangCode, remotePort);
  console.log('MetaMask initialization complete.');
};

const initApp = async (remotePort: Runtime.Port) => {
  // const connectionStream = new PortStream(remotePort);
  // console.log('BG connectionStream : ', connectionStream);
  browser.runtime.onConnect.removeListener(initApp);
  await initialize(remotePort);
};

// browser.runtime.onMessage.addListener(async (message, sender) => {
//   console.log('BG - message : ', message);
//   console.log('BG - sender : ', sender);
// });

browser.runtime.onConnect.addListener(initApp);
