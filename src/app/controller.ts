import {
  KeyringController,
  ControllerMessenger,
  PreferencesController,
} from '@metamask/controllers';
import ComposableObservableStore from './lib/ComposableObservableStore';
import { debounce } from 'ts-debounce';
import EventEmitter from 'events';
import { Mutex } from 'async-mutex';
import { MILLISECOND } from '../../shared/constants/time';

type initState = any;

interface MetamaskControllerOptions {
  infuraProjectId: string;
  showUserConfirmation?: any;
  openPopup?: any;
  initState: initState;
  initLangCode: string;
  platform: any;
  notificationManager?: any;
  browser: any;
  getRequestAccountTabIds?: any;
  getOpenMetamaskTabsIds?: any;
  encryptor: any;
}

export default class MetamaskController extends EventEmitter {
  private readonly defaultMaxListeners;

  private sendUpdate;

  private privateSendUpdate: any;

  private opts: MetamaskControllerOptions;

  private extension;

  private platform;

  private notificationManager;

  private activeControllerConnections;

  private getRequestAccountTabIds;

  private getOpenMetamaskTabsIds;

  private controllerMessenger;

  private store;

  private connections;

  private createVaultMutex;

  public keyringController;

  /**
   * @param {Object} opts
   */
  constructor(opts: MetamaskControllerOptions) {
    console.log('MetamaskControllerOptions constructor');
    super();
    this.defaultMaxListeners = 20;

    this.sendUpdate = debounce(
      this.privateSendUpdate.bind(this),
      MILLISECOND * 200,
    );
    this.opts = opts;
    this.extension = opts.browser;
    this.platform = opts.platform;
    this.notificationManager = opts.notificationManager;
    const initState = opts.initState || {};
    const version = this.platform.getVersion();
    this.recordFirstTimeInfo(initState);

    // this keeps track of how many "controllerStream" connections are open
    // the only thing that uses controller connections are open metamask UI instances
    this.activeControllerConnections = 0;

    this.getRequestAccountTabIds = opts.getRequestAccountTabIds;
    this.getOpenMetamaskTabsIds = opts.getOpenMetamaskTabsIds;

    this.controllerMessenger = new ControllerMessenger();

    // observable state store
    this.store = new ComposableObservableStore({
      config: '',
      state: initState,
      controllerMessenger: this.controllerMessenger,
      persist: true,
    });

    // external connections by origin
    // Do not modify directly. Use the associated methods.
    this.connections = {};

    // lock to ensure only one vault created at once
    this.createVaultMutex = new Mutex();

    this.extension.runtime.onInstalled.addListener((details: any) => {
      if (details.reason === 'update' && version === '8.1.0') {
        this.platform.openExtensionInBrowser();
      }
    });

    const preferences = new PreferencesController();

    const keyringOptions = {
      setAccountLabel: preferences.setAccountLabel.bind(preferences),
      removeIdentity: preferences.removeIdentity.bind(preferences),
      syncIdentities: preferences.syncIdentities.bind(preferences),
      updateIdentities: preferences.updateIdentities.bind(preferences),
      setSelectedAddress: preferences.setSelectedAddress.bind(preferences),
    };

    const keyringBaseConfig = {
      keyringTypes: [''],
      encryptor: opts.encryptor || undefined,
      //initState: initState.KeyringController,
    };

    this.keyringController = new KeyringController(
      keyringOptions,
      keyringBaseConfig,
    );
    this.keyringController.subscribe((state: any) =>
      //this._onKeyringControllerUpdate(state),
      console.log('subscribe', state),
    );
    // this.keyringController.onUnlock('unlock', () => this._onUnlock());
    // this.keyringController.onLock('lock', () => this._onLock());
  }

  /**
   * A method for initializing storage the first time.
   *
   * @param {Object} initState - The default state to initialize with.
   * @private
   */
  recordFirstTimeInfo(initState: initState) {
    if (!('firstTimeInfo' in initState)) {
      const version = this.platform.getVersion();
      initState.firstTimeInfo = {
        version,
        date: Date.now(),
      };
    }
  }

  // /**
  //  * Handle global application unlock.
  //  * Notifies all connections that the extension is unlocked, and which
  //  * account(s) are currently accessible, if any.
  //  */
  // _onUnlock() {
  //   this.notifyAllConnections(async (origin: any) => {
  //     return {
  //       method: NOTIFICATION_NAMES.unlockStateChanged,
  //       params: {
  //         isUnlocked: true,
  //         accounts: await this.getPermittedAccounts(origin),
  //       },
  //     };
  //   });

  //   // In the current implementation, this handler is triggered by a
  //   // KeyringController event. Other controllers subscribe to the 'unlock'
  //   // event of the MetaMaskController itself.
  //   this.emit('unlock');
  // }

  // /**
  //  * Handle global application lock.
  //  * Notifies all connections that the extension is locked.
  //  */
  // _onLock() {
  //   this.notifyAllConnections({
  //     method: NOTIFICATION_NAMES.unlockStateChanged,
  //     params: {
  //       isUnlocked: false,
  //     },
  //   });

  //   // In the current implementation, this handler is triggered by a
  //   // KeyringController event. Other controllers subscribe to the 'lock'
  //   // event of the MetaMaskController itself.
  //   this.emit('lock');
  // }

  // /**
  //  * Causes the RPC engines associated with all connections to emit a
  //  * notification event with the given payload.
  //  *
  //  * If the "payload" parameter is a function, the payload for each connection
  //  * will be the return value of that function called with the connection's
  //  * origin.
  //  *
  //  * The caller is responsible for ensuring that only permitted notifications
  //  * are sent.
  //  *
  //  * @param {unknown} payload - The event payload, or payload getter function.
  //  */
  // notifyAllConnections(payload: any) {
  //   const getPayload =
  //     typeof payload === 'function'
  //       ? (origin) => payload(origin)
  //       : () => payload;

  //   Object.keys(this.connections).forEach((origin) => {
  //     Object.values(this.connections[origin]).forEach(async (conn) => {
  //       if (conn.engine) {
  //         conn.engine.emit('notification', await getPayload(origin));
  //       }
  //     });
  //   });
  // }

  // /**
  //  * Gets the permitted accounts for the specified origin. Returns an empty
  //  * array if no accounts are permitted.
  //  *
  //  * @param {string} origin - The origin whose exposed accounts to retrieve.
  //  * @param {boolean} [suppressUnauthorizedError] - Suppresses the unauthorized error.
  //  * @returns {Promise<string[]>} The origin's permitted accounts, or an empty
  //  * array.
  //  */
  // async getPermittedAccounts(
  //   origin: any,
  //   { suppressUnauthorizedError = true } = {},
  // ) {
  //   try {
  //     return await this.permissionController.executeRestrictedMethod(
  //       origin,
  //       RestrictedMethods.eth_accounts,
  //     );
  //   } catch (error) {
  //     if (
  //       suppressUnauthorizedError &&
  //       error.code === rpcErrorCodes.provider.unauthorized
  //     ) {
  //       return [];
  //     }
  //     throw error;
  //   }
  // }
}
