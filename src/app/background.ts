import browser from 'webextension-polyfill';
import log from 'loglevel';
import ReadOnlyNetworkStore from './lib/network-store';
import LocalStore from './lib/local-store';
import migrations from './migrations';
import Migrator from './lib/migrator';
import { getPlatform } from './lib/util';
import {
  ENVIRONMENT_TYPE_POPUP,
  ENVIRONMENT_TYPE_NOTIFICATION,
  ENVIRONMENT_TYPE_FULLSCREEN,
  PLATFORM_CHROME,
} from '../../shared/constants/app';
import endOfStream from 'end-of-stream';
import pump from 'pump';
import ExtensionPlatform from './platforms/extension';

const metamaskInternalProcessHash = {
  [ENVIRONMENT_TYPE_POPUP]: true,
  [ENVIRONMENT_TYPE_NOTIFICATION]: true,
  [ENVIRONMENT_TYPE_FULLSCREEN]: true,
};

const metamaskBlockedPorts = ['trezor-connect'];

log.setDefaultLevel(process.env.METAMASK_DEBUG ? 'debug' : 'info');

const platform = new ExtensionPlatform();

const notificationManager = new NotificationManager();
global.METAMASK_NOTIFIER = notificationManager;

let popupIsOpen = false;
let notificationIsOpen = false;
let uiIsTriggering = false;
const openMetamaskTabsIDs = {};
const requestAccountTabIds = {};

console.log('hello world');

// state persistence
const inTest = process.env.IN_TEST;
const localStore = inTest ? new ReadOnlyNetworkStore() : new LocalStore();
let versionedData: any;

/**
 * Initializes the MetaMask controller, and sets up all platform configuration.
 *
 * @param {string} remotePort - remote application port connecting to extension.
 * @returns {Promise} Setup complete.
 */
async function initialize(remotePort: string) {
  const initState = await loadStateFromPersistence();
  const initLangCode = `{ "code": "ko", "name": "한국어" }`;
  await setupController(initState, initLangCode, remotePort);
  //await loadPhishingWarningPage();
  log.info('MetaMask initialization complete.');
}

const initApp = async (remotePort: string): Promise<void> => {
  browser.runtime.onConnect.removeListener(initApp as any);
  await initialize(remotePort);
  log.info('MetaMask initialization complete.');
};

browser.runtime.onConnect.addListener(initApp as any);

//
// State and Persistence
//

/**
 * Loads any stored data, prioritizing the latest storage strategy.
 * Migrates that data schema in case it was last loaded on an older version.
 *
 * @returns {Promise<MetaMaskState>} Last data emitted from previous instance of MetaMask.
 */
async function loadStateFromPersistence() {
  // migrations
  const migrator = new Migrator({ migrations });
  migrator.on('error', console.warn);

  // read from disk
  // first from preferred, async API:
  versionedData =
    (await localStore.get()) || migrator.generateInitialState(firstTimeState);

  // check if somehow state is empty
  // this should never happen but new error reporting suggests that it has
  // for a small number of users
  // https://github.com/metamask/metamask-extension/issues/3919
  if (versionedData && !versionedData.data) {
    // unable to recover, clear state
    versionedData = migrator.generateInitialState(firstTimeState);
    sentry.captureMessage('MetaMask - Empty vault found - unable to recover');
  }

  // report migration errors to sentry
  migrator.on('error', (err) => {
    // get vault structure without secrets
    const vaultStructure = getObjStructure(versionedData);
    sentry.captureException(err, {
      // "extra" key is required by Sentry
      extra: { vaultStructure },
    });
  });

  // migrate data
  versionedData = await migrator.migrateData(versionedData);
  if (!versionedData) {
    throw new Error('MetaMask - migrator returned undefined');
  }

  // write to disk
  if (localStore.isSupported) {
    localStore.set(versionedData);
  } else {
    // throw in setTimeout so as to not block boot
    setTimeout(() => {
      throw new Error('MetaMask - Localstore not supported');
    });
  }

  // return just the data
  return versionedData.data;
}

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
function setupController(
  initState: object,
  initLangCode: string,
  remoteSourcePort: string,
) {
  //
  // MetaMask Controller
  //

  const controller = new MetamaskController({
    infuraProjectId: process.env.INFURA_PROJECT_ID,
    // User confirmation callbacks:
    showUserConfirmation: triggerUi,
    openPopup,
    // initial state
    initState,
    // initial locale code
    initLangCode,
    // platform specific api
    platform,
    notificationManager,
    browser,
    getRequestAccountTabIds: () => {
      return requestAccountTabIds;
    },
    getOpenMetamaskTabsIds: () => {
      return openMetamaskTabsIDs;
    },
  });

  // setup state persistence
  pump(
    storeAsStream(controller.store),
    debounce(1000),
    storeTransformStream(versionifyData),
    createStreamSink(persistData),
    (error) => {
      log.error('MetaMask - Persistence pipeline failed', error);
    },
  );

  /**
   * Assigns the given state to the versioned object (with metadata), and returns that.
   *
   * @param {Object} state - The state object as emitted by the MetaMaskController.
   * @returns {VersionedData} The state object wrapped in an object that includes a metadata key.
   */
  function versionifyData(state: any) {
    versionedData.data = state;
    return versionedData;
  }

  let dataPersistenceFailing = false;

  async function persistData(state: any) {
    if (!state) {
      throw new Error('MetaMask - updated state is missing');
    }
    if (!state.data) {
      throw new Error('MetaMask - updated state does not have data');
    }
    if (localStore.isSupported) {
      try {
        await localStore.set(state);
        if (dataPersistenceFailing) {
          dataPersistenceFailing = false;
        }
      } catch (err) {
        // log error so we dont break the pipeline
        if (!dataPersistenceFailing) {
          dataPersistenceFailing = true;
          captureException(err);
        }
        log.error('error setting state in local store:', err);
      }
    }
  }

  //
  // connect to other contexts
  //
  if (remoteSourcePort) {
    connectRemote(remoteSourcePort);
  }

  browser.runtime.onConnect.addListener(connectRemote);
  browser.runtime.onConnectExternal.addListener(connectExternal);

  const isClientOpenStatus = () => {
    return (
      popupIsOpen ||
      Boolean(Object.keys(openMetamaskTabsIDs).length) ||
      notificationIsOpen
    );
  };

  const onCloseEnvironmentInstances = (isClientOpen, environmentType) => {
    // if all instances of metamask are closed we call a method on the controller to stop gasFeeController polling
    if (isClientOpen === false) {
      controller.onClientClosed();
      // otherwise we want to only remove the polling tokens for the environment type that has closed
    } else {
      // in the case of fullscreen environment a user might have multiple tabs open so we don't want to disconnect all of
      // its corresponding polling tokens unless all tabs are closed.
      if (
        environmentType === ENVIRONMENT_TYPE_FULLSCREEN &&
        Boolean(Object.keys(openMetamaskTabsIDs).length)
      ) {
        return;
      }
      controller.onEnvironmentTypeClosed(environmentType);
    }
  };

  /**
   * A runtime.Port object, as provided by the browser:
   *
   * @see https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/runtime/Port
   * @typedef Port
   * @type Object
   */

  /**
   * Connects a Port to the MetaMask controller via a multiplexed duplex stream.
   * This method identifies trusted (MetaMask) interfaces, and connects them differently from untrusted (web pages).
   *
   * @param {Port} remotePort - The port provided by a new context.
   */
  function connectRemote(remotePort: Port) {
    const processName = remotePort.name;

    if (metamaskBlockedPorts.includes(remotePort.name)) {
      return;
    }

    let isMetaMaskInternalProcess = false;
    const sourcePlatform = getPlatform();

    if (sourcePlatform === PLATFORM_CHROME) {
      isMetaMaskInternalProcess =
        remotePort.sender.origin === `chrome-extension://${browser.runtime.id}`;
    }

    const senderUrl = remotePort.sender?.url
      ? new URL(remotePort.sender.url)
      : null;

    if (isMetaMaskInternalProcess) {
      const portStream = new PortStream(remotePort);
      // communication with popup
      controller.isClientOpen = true;
      controller.setupTrustedCommunication(portStream, remotePort.sender);

      // Message below if captured by UI code in app/scripts/ui.js which will trigger UI initialisation
      // This ensures that UI is initialised only after background is ready
      // It fixes the issue of blank screen coming when extension is loaded, the issue is very frequent in MV3
      remotePort.postMessage({ name: 'CONNECTION_READY' });

      if (processName === ENVIRONMENT_TYPE_POPUP) {
        popupIsOpen = true;
        endOfStream(portStream, () => {
          popupIsOpen = false;
          const isClientOpen = isClientOpenStatus();
          controller.isClientOpen = isClientOpen;
          onCloseEnvironmentInstances(isClientOpen, ENVIRONMENT_TYPE_POPUP);
        });
      }

      if (processName === ENVIRONMENT_TYPE_NOTIFICATION) {
        notificationIsOpen = true;

        endOfStream(portStream, () => {
          notificationIsOpen = false;
          const isClientOpen = isClientOpenStatus();
          controller.isClientOpen = isClientOpen;
          onCloseEnvironmentInstances(
            isClientOpen,
            ENVIRONMENT_TYPE_NOTIFICATION,
          );
        });
      }

      if (processName === ENVIRONMENT_TYPE_FULLSCREEN) {
        const tabId = remotePort.sender.tab.id;
        openMetamaskTabsIDs[tabId] = true;

        endOfStream(portStream, () => {
          delete openMetamaskTabsIDs[tabId];
          const isClientOpen = isClientOpenStatus();
          controller.isClientOpen = isClientOpen;
          onCloseEnvironmentInstances(
            isClientOpen,
            ENVIRONMENT_TYPE_FULLSCREEN,
          );
        });
      }
    } else if (
      senderUrl &&
      senderUrl.origin === phishingPageUrl.origin &&
      senderUrl.pathname === phishingPageUrl.pathname
    ) {
      const portStream = new PortStream(remotePort);
      controller.setupPhishingCommunication({
        connectionStream: portStream,
      });
    } else {
      if (remotePort.sender && remotePort.sender.tab && remotePort.sender.url) {
        const tabId = remotePort.sender.tab.id;
        const url = new URL(remotePort.sender.url);
        const { origin } = url;

        remotePort.onMessage.addListener((msg) => {
          if (msg.data && msg.data.method === 'eth_requestAccounts') {
            requestAccountTabIds[origin] = tabId;
          }
        });
      }
      connectExternal(remotePort);
    }
  }

  // communication with page or other extension
  function connectExternal(remotePort) {
    const portStream = new PortStream(remotePort);
    controller.setupUntrustedCommunication({
      connectionStream: portStream,
      sender: remotePort.sender,
    });
  }

  //
  // User Interface setup
  //

  updateBadge();
  controller.txController.on(
    METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE,
    updateBadge,
  );
  controller.messageManager.on(
    METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE,
    updateBadge,
  );
  controller.personalMessageManager.on(
    METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE,
    updateBadge,
  );
  controller.decryptMessageManager.on(
    METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE,
    updateBadge,
  );
  controller.encryptionPublicKeyManager.on(
    METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE,
    updateBadge,
  );
  controller.typedMessageManager.on(
    METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE,
    updateBadge,
  );
  controller.appStateController.on(
    METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE,
    updateBadge,
  );

  controller.controllerMessenger.subscribe(
    METAMASK_CONTROLLER_EVENTS.APPROVAL_STATE_CHANGE,
    updateBadge,
  );

  /**
   * Updates the Web Extension's "badge" number, on the little fox in the toolbar.
   * The number reflects the current number of pending transactions or message signatures needing user approval.
   */
  function updateBadge() {
    let label = '';
    const count = getUnapprovedTransactionCount();
    if (count) {
      label = String(count);
    }
    // browserAction has been replaced by action in MV3
    browser.action.setBadgeText({ text: label });
    browser.action.setBadgeBackgroundColor({ color: '#037DD6' });
  }

  function getUnapprovedTransactionCount() {
    const unapprovedTxCount = controller.txController.getUnapprovedTxCount();
    const { unapprovedMsgCount } = controller.messageManager;
    const { unapprovedPersonalMsgCount } = controller.personalMessageManager;
    const { unapprovedDecryptMsgCount } = controller.decryptMessageManager;
    const { unapprovedEncryptionPublicKeyMsgCount } =
      controller.encryptionPublicKeyManager;
    const { unapprovedTypedMessagesCount } = controller.typedMessageManager;
    const pendingApprovalCount =
      controller.approvalController.getTotalApprovalCount();
    const waitingForUnlockCount =
      controller.appStateController.waitingForUnlock.length;
    return (
      unapprovedTxCount +
      unapprovedMsgCount +
      unapprovedPersonalMsgCount +
      unapprovedDecryptMsgCount +
      unapprovedEncryptionPublicKeyMsgCount +
      unapprovedTypedMessagesCount +
      pendingApprovalCount +
      waitingForUnlockCount
    );
  }

  notificationManager.on(
    NOTIFICATION_MANAGER_EVENTS.POPUP_CLOSED,
    ({ automaticallyClosed }) => {
      if (!automaticallyClosed) {
        rejectUnapprovedNotifications();
      } else if (getUnapprovedTransactionCount() > 0) {
        triggerUi();
      }
    },
  );

  function rejectUnapprovedNotifications() {
    Object.keys(
      controller.txController.txStateManager.getUnapprovedTxList(),
    ).forEach((txId) =>
      controller.txController.txStateManager.setTxStatusRejected(txId),
    );
    controller.messageManager.messages
      .filter((msg) => msg.status === 'unapproved')
      .forEach((tx) =>
        controller.messageManager.rejectMsg(
          tx.id,
          REJECT_NOTFICIATION_CLOSE_SIG,
        ),
      );
    controller.personalMessageManager.messages
      .filter((msg) => msg.status === 'unapproved')
      .forEach((tx) =>
        controller.personalMessageManager.rejectMsg(
          tx.id,
          REJECT_NOTFICIATION_CLOSE_SIG,
        ),
      );
    controller.typedMessageManager.messages
      .filter((msg) => msg.status === 'unapproved')
      .forEach((tx) =>
        controller.typedMessageManager.rejectMsg(
          tx.id,
          REJECT_NOTFICIATION_CLOSE_SIG,
        ),
      );
    controller.decryptMessageManager.messages
      .filter((msg) => msg.status === 'unapproved')
      .forEach((tx) =>
        controller.decryptMessageManager.rejectMsg(
          tx.id,
          REJECT_NOTFICIATION_CLOSE,
        ),
      );
    controller.encryptionPublicKeyManager.messages
      .filter((msg) => msg.status === 'unapproved')
      .forEach((tx) =>
        controller.encryptionPublicKeyManager.rejectMsg(
          tx.id,
          REJECT_NOTFICIATION_CLOSE,
        ),
      );

    // Finally, reject all approvals managed by the ApprovalController
    controller.approvalController.clear(
      ethErrors.provider.userRejectedRequest(),
    );

    updateBadge();
  }

  return Promise.resolve();
}

//
// Etc...
//

/**
 * Opens the browser popup for user confirmation
 */
async function triggerUi() {
  const tabs = await platform.getActiveTabs();
  const currentlyActiveMetamaskTab = Boolean(
    tabs.find((tab) => openMetamaskTabsIDs[tab.id]),
  );
  // Vivaldi is not closing port connection on popup close, so popupIsOpen does not work correctly
  // To be reviewed in the future if this behaviour is fixed - also the way we determine isVivaldi variable might change at some point
  const isVivaldi =
    tabs.length > 0 &&
    tabs[0].extData &&
    tabs[0].extData.indexOf('vivaldi_tab') > -1;
  if (
    !uiIsTriggering &&
    (isVivaldi || !popupIsOpen) &&
    !currentlyActiveMetamaskTab
  ) {
    uiIsTriggering = true;
    try {
      await notificationManager.showPopup();
    } finally {
      uiIsTriggering = false;
    }
  }
}

export {};
