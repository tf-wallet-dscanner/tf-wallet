import {
  ApprovalController,
  ControllerMessenger,
  PermissionController,
} from '@metamask/controllers';
import { Mutex } from 'async-mutex';
import KeyringController from 'eth-keyring-controller';
import {
  //EthereumRpcError,
  //ethErrors,
  errorCodes as rpcErrorCodes,
} from 'eth-rpc-errors';
import EventEmitter from 'events';
import { debounce } from 'ts-debounce';

import {
  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  MESSAGE_TYPE, ///: END:ONLY_INCLUDE_IN
  // ORIGIN_METAMASK,
  SUBJECT_TYPES,
} from '../shared/constants/app';
import { RestrictedMethods } from '../shared/constants/permissions';
import { MILLISECOND } from '../shared/constants/time';
import {
  NOTIFICATION_NAMES,
  buildSnapEndowmentSpecifications,
  buildSnapRestrictedMethodSpecifications, ///: END:ONLY_INCLUDE_IN
  getCaveatSpecifications,
  getPermissionSpecifications,
  unrestrictedMethods, ///: BEGIN:ONLY_INCLUDE_IN(flask)
} from './controllers/permissions';
import ComposableObservableStore from './lib/ComposableObservableStore';
import createMetaRPCHandler from './lib/createMetaRPCHandler';
import { setupMultiplex } from './lib/stream-utils';

export const METAMASK_CONTROLLER_EVENTS = {
  // Fired after state changes that impact the extension badge (unapproved msg count)
  // The process of updating the badge happens in app/scripts/background.js.
  UPDATE_BADGE: 'updateBadge',
  // TODO: Add this and similar enums to @metamask/controllers and export them
  APPROVAL_STATE_CHANGE: 'ApprovalController:stateChange',
};

type initState = any;

export interface MetamaskControllerOptions {
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
  encryptor?: any;
}

export default class MetamaskController extends EventEmitter {
  private readonly defaultMaxListeners;

  private sendUpdate: any;

  private opts: MetamaskControllerOptions;

  private extension;

  private platform;

  private notificationManager;

  private activeControllerConnections;

  private getRequestAccountTabIds;

  private getOpenMetamaskTabsIds;

  private controllerMessenger: any;

  private store;

  private memStore;

  private connections: any;

  private createVaultMutex;

  public keyringController;

  // private preferencesController;

  private permissionController;

  private approvalController;

  private isClientOpenAndUnlocked: any;

  public isClientOpen: any;

  /**
   * @param {Object} opts
   */
  constructor(opts: MetamaskControllerOptions) {
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
    console.log('MetamaskController: initState', initState);
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

    // next, we will initialize the controllers
    // controller initialization order matters

    this.approvalController = new ApprovalController({
      messenger: this.controllerMessenger.getRestricted({
        name: 'ApprovalController',
      }),
      showApprovalRequest: opts.showUserConfirmation,
    });

    // this.preferencesController = new PreferencesController({
    //   initState: initState.PreferencesController,
    //   initLangCode: opts.initLangCode,
    //   openPopup: opts.openPopup,
    //   network: this.networkController,
    //   provider: this.provider,
    //   migrateAddressBookState: this.migrateAddressBookState.bind(this),
    // });

    this.keyringController = new KeyringController({
      keyringTypes: [''],
      initState: initState.KeyringController,
      encryptor: opts.encryptor || undefined,
    });

    this.keyringController.memStore.subscribe((state: any) =>
      this._onKeyringControllerUpdate(state),
    );
    this.keyringController.on('unlock', () => this._onUnlock());
    this.keyringController.on('lock', () => this._onLock());

    const getIdentities = () => {
      /**
       * @TODO PreferencesController
       */
      //this.preferencesController.store.getState().identities;
    };

    this.permissionController = new PermissionController({
      messenger: this.controllerMessenger.getRestricted({
        name: 'PermissionController',
        allowedActions: [
          `${this.approvalController.name}:addRequest`,
          `${this.approvalController.name}:hasRequest`,
          `${this.approvalController.name}:acceptRequest`,
          `${this.approvalController.name}:rejectRequest`,
        ] as never,
      }),
      state: initState.PermissionController,
      caveatSpecifications: getCaveatSpecifications({ getIdentities }),
      permissionSpecifications: {
        ...getPermissionSpecifications({
          getIdentities,
          getAllAccounts: this.keyringController.getAccounts.bind(
            this.keyringController,
          ),
          captureKeyringTypesWithMissingIdentities: (
            identities = {},
            accounts = [],
          ) => {
            const accountsMissingIdentities = accounts.filter(
              (address) => !identities[address],
            );
            const keyringTypesWithMissingIdentities =
              accountsMissingIdentities.map(
                (address) =>
                  this.keyringController.getKeyringForAccount(address)?.type,
              );

            const identitiesCount = Object.keys(identities || {}).length;

            console.log(
              'getIdentities',
              keyringTypesWithMissingIdentities,
              identitiesCount,
            );

            /**
             * @TODO AccountTracker
             */
            // const accountTrackerCount = Object.keys(
            //   this.accountTracker.store.getState().accounts || {},
            // ).length;
          },
        }),
        /**
         * @TODO what is `BEGIN:ONLY_INCLUDE_IN(flask)` ??
         */
        ///: BEGIN:ONLY_INCLUDE_IN(flask)
        ...this.getSnapPermissionSpecifications(),
        ///: END:ONLY_INCLUDE_IN
      },
      unrestrictedMethods,
    });

    this.memStore = new ComposableObservableStore({
      config: {
        // AppStateController: this.appStateController.store,
        // NetworkController: this.networkController.store,
        // AccountTracker: this.accountTracker.store,
        // TxController: this.txController.memStore,
        // CachedBalancesController: this.cachedBalancesController.store,
        // TokenRatesController: this.tokenRatesController,
        // MessageManager: this.messageManager.memStore,
        // PersonalMessageManager: this.personalMessageManager.memStore,
        // DecryptMessageManager: this.decryptMessageManager.memStore,
        // EncryptionPublicKeyManager: this.encryptionPublicKeyManager.memStore,
        // TypesMessageManager: this.typedMessageManager.memStore,
        KeyringController: this.keyringController.memStore,
        // PreferencesController: this.preferencesController.store,
        // MetaMetricsController: this.metaMetricsController.store,
        // AddressBookController: this.addressBookController,
        // CurrencyController: this.currencyRateController,
        // AlertController: this.alertController.store,
        // OnboardingController: this.onboardingController.store,
        // IncomingTransactionsController: this.incomingTransactionsController
        //   .store,
        PermissionController: this.permissionController,
        // PermissionLogController: this.permissionLogController.store,
        // SubjectMetadataController: this.subjectMetadataController,
        // ThreeBoxController: this.threeBoxController.store,
        // SwapsController: this.swapsController.store,
        // EnsController: this.ensController.store,
        ApprovalController: this.approvalController,
        // AnnouncementController: this.announcementController,
        // GasFeeController: this.gasFeeController,
        // TokenListController: this.tokenListController,
        // TokensController: this.tokensController,
        // SmartTransactionsController: this.smartTransactionsController,
        // CollectiblesController: this.collectiblesController,
        // ///: BEGIN:ONLY_INCLUDE_IN(flask)
        // SnapController: this.snapController,
        // NotificationController: this.notificationController,
        // ///: END:ONLY_INCLUDE_IN
      },
      controllerMessenger: this.controllerMessenger,
    });
    this.memStore.subscribe(this.sendUpdate.bind(this));
  }

  ///: BEGIN:ONLY_INCLUDE_IN(flask)
  /**
   * Constructor helper for getting Snap permission specifications.
   */
  getSnapPermissionSpecifications() {
    return {
      ...buildSnapEndowmentSpecifications(),
      ...buildSnapRestrictedMethodSpecifications({
        addSnap: this.controllerMessenger.call.bind(
          this.controllerMessenger,
          'SnapController:add',
        ),
        clearSnapState: this.controllerMessenger.call.bind(
          this.controllerMessenger,
          'SnapController:clearSnapState',
        ),
        getMnemonic: this.getPrimaryKeyringMnemonic.bind(this),
        /**
         * @TODO AppStateController
         */
        // getUnlockPromise: this.appStateController.getUnlockPromise.bind(
        //   this.appStateController,
        // ),
        getSnap: this.controllerMessenger.call.bind(
          this.controllerMessenger,
          'SnapController:get',
        ),
        getSnapRpcHandler: this.controllerMessenger.call.bind(
          this.controllerMessenger,
          'SnapController:getRpcMessageHandler',
        ),
        getSnapState: this.controllerMessenger.call.bind(
          this.controllerMessenger,
          'SnapController:getSnapState',
        ),
        showConfirmation: (origin: any, confirmationData: any) =>
          this.approvalController.addAndShowApprovalRequest({
            origin,
            type: MESSAGE_TYPE.SNAP_CONFIRM,
            requestData: confirmationData,
          }),
        showNativeNotification: (origin: any, args: any) =>
          this.controllerMessenger.call(
            'RateLimitController:call',
            origin,
            'showNativeNotification',
            origin,
            args.message,
          ),
        showInAppNotification: (origin: any, args: any) =>
          this.controllerMessenger.call(
            'RateLimitController:call',
            origin,
            'showInAppNotification',
            origin,
            args.message,
          ),
        updateSnapState: this.controllerMessenger.call.bind(
          this.controllerMessenger,
          'SnapController:updateSnapState',
        ),
      }),
    };
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

  /**
   * Gets the permitted accounts for the specified origin. Returns an empty
   * array if no accounts are permitted.
   *
   * @param {string} origin - The origin whose exposed accounts to retrieve.
   * @param {boolean} [suppressUnauthorizedError] - Suppresses the unauthorized error.
   * @returns {Promise<string[]>} The origin's permitted accounts, or an empty
   * array.
   */
  async getPermittedAccounts(
    origin: any,
    { suppressUnauthorizedError = true } = {},
  ) {
    try {
      return await this.permissionController.executeRestrictedMethod(
        origin,
        RestrictedMethods.eth_accounts,
      );
    } catch (error: any) {
      if (
        suppressUnauthorizedError &&
        error.code === rpcErrorCodes.provider.unauthorized
      ) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Causes the RPC engines associated with all connections to emit a
   * notification event with the given payload.
   *
   * If the "payload" parameter is a function, the payload for each connection
   * will be the return value of that function called with the connection's
   * origin.
   *
   * The caller is responsible for ensuring that only permitted notifications
   * are sent.
   *
   * @param {unknown} payload - The event payload, or payload getter function.
   */
  notifyAllConnections(payload: any) {
    const getPayload =
      typeof payload === 'function'
        ? (origin: any) => payload(origin)
        : () => payload;

    Object.keys(this.connections).forEach((origin) => {
      Object.values(this.connections[origin]).forEach(async (conn: any) => {
        if (conn.engine) {
          conn.engine.emit('notification', await getPayload(origin));
        }
      });
    });
  }

  // handlers

  /**
   * Handle a KeyringController update
   *
   * @param {Object} state - the KC state
   * @returns {Promise<void>}
   * @private
   */
  async _onKeyringControllerUpdate(state: any) {
    const { keyrings } = state;
    const addresses = keyrings.reduce(
      (acc: any, { accounts }: any) => acc.concat(accounts),
      [],
    );

    if (!addresses.length) {
      return;
    }

    // Ensure preferences + identities controller know about all addresses
    // this.preferencesController.syncAddresses(addresses);
    // this.accountTracker.syncWithAddresses(addresses);
  }

  /**
   * Handle global application unlock.
   * Notifies all connections that the extension is unlocked, and which
   * account(s) are currently accessible, if any.
   */
  _onUnlock() {
    this.notifyAllConnections(async (origin: any) => {
      return {
        method: NOTIFICATION_NAMES.unlockStateChanged,
        params: {
          isUnlocked: true,
          accounts: await this.getPermittedAccounts(origin),
        },
      };
    });

    // In the current implementation, this handler is triggered by a
    // KeyringController event. Other controllers subscribe to the 'unlock'
    // event of the MetaMaskController itself.
    this.emit('unlock');
  }

  /**
   * Handle global application lock.
   * Notifies all connections that the extension is locked.
   */
  _onLock() {
    this.notifyAllConnections({
      method: NOTIFICATION_NAMES.unlockStateChanged,
      params: {
        isUnlocked: false,
      },
    });

    // In the current implementation, this handler is triggered by a
    // KeyringController event. Other controllers subscribe to the 'lock'
    // event of the MetaMaskController itself.
    this.emit('lock');
  }

  // /**
  //  * Handle memory state updates.
  //  * - Ensure isClientOpenAndUnlocked is updated
  //  * - Notifies all connections with the new provider network state
  //  *   - The external providers handle diffing the state
  //  *
  //  * @param newState
  //  */
  // _onStateUpdate(newState: any) {
  //   this.isClientOpenAndUnlocked = newState.isUnlocked && this._isClientOpen;
  //   this.notifyAllConnections({
  //     method: NOTIFICATION_NAMES.chainChanged,
  //     params: this.getProviderNetworkState(newState),
  //   });
  // }

  //=============================================================================
  // EXPOSED TO THE UI SUBSYSTEM
  //=============================================================================

  /**
   * The metamask-state of the various controllers, made available to the UI
   *
   * @returns {Object} status
   */
  getState() {
    const { vault } = this.keyringController.store.getState();
    const isInitialized = Boolean(vault);

    return {
      isInitialized,
      ...this.memStore.getFlatState(),
    };
  }

  /**
   * A method for emitting the full MetaMask state to all registered listeners.
   *
   * @private
   */
  privateSendUpdate() {
    this.emit('update', this.getState());
  }

  /**
   * @returns {boolean} Whether the extension is unlocked.
   */
  isUnlocked() {
    return this.keyringController.memStore.getState().isUnlocked;
  }

  //=============================================================================
  // VAULT / KEYRING RELATED METHODS
  //=============================================================================

  /**
   * Creates a new Vault and create a new keychain.
   *
   * A vault, or KeyringController, is a controller that contains
   * many different account strategies, currently called Keyrings.
   * Creating it new means wiping all previous keyrings.
   *
   * A keychain, or keyring, controls many accounts with a single backup and signing strategy.
   * For example, a mnemonic phrase can generate many accounts, and is a keyring.
   *
   * @param {string} password
   * @returns {Object} vault
   */
  async createNewVaultAndKeychain(password: string) {
    const releaseLock = await this.createVaultMutex.acquire();
    try {
      let vault;
      const accounts = await this.keyringController.getAccounts();
      if (accounts.length > 0) {
        vault = await this.keyringController.fullUpdate();
      } else {
        vault = await this.keyringController.createNewVaultAndKeychain(
          password,
        );
        const addresses = await this.keyringController.getAccounts();
        console.log('createNewVaultAndKeychain', addresses);
        //this.preferencesController.setAddresses(addresses);
        //this.selectFirstIdentity();
      }

      return vault;
    } finally {
      releaseLock();
    }
  }

  /**
   * Create a new Vault and restore an existent keyring.
   *
   * @param {string} password
   * @param {number[]} encodedSeedPhrase - The seed phrase, encoded as an array
   * of UTF-8 bytes.
   */
  async createNewVaultAndRestore(
    password: string,
    encodedSeedPhrase: number[],
  ) {
    const releaseLock = await this.createVaultMutex.acquire();
    try {
      //let accounts, lastBalance;

      const seedPhraseAsBuffer = Buffer.from(encodedSeedPhrase);

      const { keyringController } = this;

      // clear known identities
      // this.preferencesController.setAddresses([]);

      // clear permissions
      this.permissionController.clearState();

      // clear accounts in accountTracker
      // this.accountTracker.clearAccounts();

      // clear cachedBalances
      // this.cachedBalancesController.clearCachedBalances();

      // clear unapproved transactions
      // this.txController.txStateManager.clearUnapprovedTxs();

      // create new vault
      const vault = await keyringController.createNewVaultAndRestore(
        password,
        seedPhraseAsBuffer,
      );

      // const ethQuery = new EthQuery(this.provider);
      // accounts = await keyringController.getAccounts();
      // lastBalance = await this.getBalance(
      //   accounts[accounts.length - 1],
      //   ethQuery,
      // );

      const primaryKeyring =
        keyringController.getKeyringsByType('HD Key Tree')[0];
      if (!primaryKeyring) {
        throw new Error('MetamaskController - No HD Key Tree found');
      }

      // seek out the first zero balance
      // while (lastBalance !== '0x0') {
      //   await keyringController.addNewAccount(primaryKeyring);
      //   accounts = await keyringController.getAccounts();
      //   lastBalance = await this.getBalance(
      //     accounts[accounts.length - 1],
      //     ethQuery,
      //   );
      // }

      // remove extra zero balance account potentially created from seeking ahead
      // if (accounts.length > 1 && lastBalance === '0x0') {
      //   await this.removeAccount(accounts[accounts.length - 1]);
      //   accounts = await keyringController.getAccounts();
      // }

      // This must be set as soon as possible to communicate to the
      // keyring's iframe and have the setting initialized properly
      // Optimistically called to not block MetaMask login due to
      // Ledger Keyring GitHub downtime
      // const transportPreference = this.preferencesController.getLedgerTransportPreference();
      // this.setLedgerTransportPreference(transportPreference);

      // set new identities
      // this.preferencesController.setAddresses(accounts);
      // this.selectFirstIdentity();
      return vault;
    } finally {
      releaseLock();
    }
  }

  /**
   * @type Identity
   * @property {string} name - The account nickname.
   * @property {string} address - The account's ethereum address, in lower case.
   * @property {boolean} mayBeFauceting - Whether this account is currently
   * receiving funds from our automatic Ropsten faucet.
   */

  // /**
  //  * Sets the first address in the state to the selected address
  //  */
  // selectFirstIdentity() {
  //   const { identities } = this.preferencesController.store.getState();
  //   const address = Object.keys(identities)[0];
  //   this.preferencesController.setSelectedAddress(address);
  // }

  /**
   * Gets the mnemonic of the user's primary keyring.
   */
  getPrimaryKeyringMnemonic() {
    const keyring = this.keyringController.getKeyringsByType('HD Key Tree')[0];
    if (!keyring.mnemonic) {
      throw new Error('Primary keyring mnemonic unavailable.');
    }
    return keyring.mnemonic;
  }

  /**
   * Returns an Object containing API Callback Functions.
   * These functions are the interface for the UI.
   * The API object can be transmitted over a stream via JSON-RPC.
   *
   * @returns {Object} Object containing API functions.
   */
  getApi() {
    const {
      // addressBookController,
      // alertController,
      // approvalController,
      // appStateController,
      // collectiblesController,
      // collectibleDetectionController,
      // currencyRateController,
      // detectTokensController,
      // ensController,
      // gasFeeController,
      keyringController,
      // metaMetricsController,
      // networkController,
      // announcementController,
      // onboardingController,
      // permissionController,
      // preferencesController,
      // qrHardwareKeyring,
      // swapsController,
      // threeBoxController,
      // tokensController,
      // smartTransactionsController,
      // txController,
      // assetsContractController,
    } = this;

    return {
      // etc
      getState: this.getState.bind(this),
      // setCurrentCurrency: currencyRateController.setCurrentCurrency.bind(
      //   currencyRateController,
      // ),
      // setUseBlockie: preferencesController.setUseBlockie.bind(
      //   preferencesController,
      // ),
      // setUseNonceField: preferencesController.setUseNonceField.bind(
      //   preferencesController,
      // ),
      // setUsePhishDetect: preferencesController.setUsePhishDetect.bind(
      //   preferencesController,
      // ),
      // setUseTokenDetection: preferencesController.setUseTokenDetection.bind(
      //   preferencesController,
      // ),
      // setUseCollectibleDetection:
      //   preferencesController.setUseCollectibleDetection.bind(
      //     preferencesController,
      //   ),
      // setOpenSeaEnabled: preferencesController.setOpenSeaEnabled.bind(
      //   preferencesController,
      // ),
      // setIpfsGateway: preferencesController.setIpfsGateway.bind(
      //   preferencesController,
      // ),
      // setParticipateInMetaMetrics:
      //   metaMetricsController.setParticipateInMetaMetrics.bind(
      //     metaMetricsController,
      //   ),
      // setCurrentLocale: preferencesController.setCurrentLocale.bind(
      //   preferencesController,
      // ),
      // markPasswordForgotten: this.markPasswordForgotten.bind(this),
      // unMarkPasswordForgotten: this.unMarkPasswordForgotten.bind(this),
      // getRequestAccountTabIds: this.getRequestAccountTabIds,
      // getOpenMetamaskTabsIds: this.getOpenMetamaskTabsIds,
      // markNotificationPopupAsAutomaticallyClosed: () =>
      //   this.notificationManager.markAsAutomaticallyClosed(),

      // // primary HD keyring management
      // addNewAccount: this.addNewAccount.bind(this),
      // verifySeedPhrase: this.verifySeedPhrase.bind(this),
      // resetAccount: this.resetAccount.bind(this),
      // removeAccount: this.removeAccount.bind(this),
      // importAccountWithStrategy: this.importAccountWithStrategy.bind(this),

      // // hardware wallets
      // connectHardware: this.connectHardware.bind(this),
      // forgetDevice: this.forgetDevice.bind(this),
      // checkHardwareStatus: this.checkHardwareStatus.bind(this),
      // unlockHardwareWalletAccount: this.unlockHardwareWalletAccount.bind(this),
      // setLedgerTransportPreference:
      //   this.setLedgerTransportPreference.bind(this),
      // attemptLedgerTransportCreation:
      //   this.attemptLedgerTransportCreation.bind(this),
      // establishLedgerTransportPreference:
      //   this.establishLedgerTransportPreference.bind(this),

      // // qr hardware devices
      // submitQRHardwareCryptoHDKey:
      //   qrHardwareKeyring.submitCryptoHDKey.bind(qrHardwareKeyring),
      // submitQRHardwareCryptoAccount:
      //   qrHardwareKeyring.submitCryptoAccount.bind(qrHardwareKeyring),
      // cancelSyncQRHardware:
      //   qrHardwareKeyring.cancelSync.bind(qrHardwareKeyring),
      // submitQRHardwareSignature:
      //   qrHardwareKeyring.submitSignature.bind(qrHardwareKeyring),
      // cancelQRHardwareSignRequest:
      //   qrHardwareKeyring.cancelSignRequest.bind(qrHardwareKeyring),

      // // mobile
      // fetchInfoToSync: this.fetchInfoToSync.bind(this),

      // // vault management
      // submitPassword: this.submitPassword.bind(this),
      // verifyPassword: this.verifyPassword.bind(this),

      // // network management
      // setProviderType:
      //   networkController.setProviderType.bind(networkController),
      // rollbackToPreviousProvider:
      //   networkController.rollbackToPreviousProvider.bind(networkController),
      // setCustomRpc: this.setCustomRpc.bind(this),
      // updateAndSetCustomRpc: this.updateAndSetCustomRpc.bind(this),
      // delCustomRpc: this.delCustomRpc.bind(this),

      // // PreferencesController
      // setSelectedAddress: preferencesController.setSelectedAddress.bind(
      //   preferencesController,
      // ),
      // addToken: tokensController.addToken.bind(tokensController),
      // rejectWatchAsset:
      //   tokensController.rejectWatchAsset.bind(tokensController),
      // acceptWatchAsset:
      //   tokensController.acceptWatchAsset.bind(tokensController),
      // updateTokenType: tokensController.updateTokenType.bind(tokensController),
      // removeToken: tokensController.removeAndIgnoreToken.bind(tokensController),
      // setAccountLabel: preferencesController.setAccountLabel.bind(
      //   preferencesController,
      // ),
      // setFeatureFlag: preferencesController.setFeatureFlag.bind(
      //   preferencesController,
      // ),
      // setPreference: preferencesController.setPreference.bind(
      //   preferencesController,
      // ),

      // addKnownMethodData: preferencesController.addKnownMethodData.bind(
      //   preferencesController,
      // ),
      // setDismissSeedBackUpReminder:
      //   preferencesController.setDismissSeedBackUpReminder.bind(
      //     preferencesController,
      //   ),
      // setAdvancedGasFee: preferencesController.setAdvancedGasFee.bind(
      //   preferencesController,
      // ),
      // setEIP1559V2Enabled: preferencesController.setEIP1559V2Enabled.bind(
      //   preferencesController,
      // ),
      // setTheme: preferencesController.setTheme.bind(preferencesController),

      // // AssetsContractController
      // getTokenStandardAndDetails: this.getTokenStandardAndDetails.bind(this),

      // // CollectiblesController
      // addCollectible: collectiblesController.addCollectible.bind(
      //   collectiblesController,
      // ),

      // addCollectibleVerifyOwnership:
      //   collectiblesController.addCollectibleVerifyOwnership.bind(
      //     collectiblesController,
      //   ),

      // removeAndIgnoreCollectible:
      //   collectiblesController.removeAndIgnoreCollectible.bind(
      //     collectiblesController,
      //   ),

      // removeCollectible: collectiblesController.removeCollectible.bind(
      //   collectiblesController,
      // ),

      // checkAndUpdateAllCollectiblesOwnershipStatus:
      //   collectiblesController.checkAndUpdateAllCollectiblesOwnershipStatus.bind(
      //     collectiblesController,
      //   ),

      // checkAndUpdateSingleCollectibleOwnershipStatus:
      //   collectiblesController.checkAndUpdateSingleCollectibleOwnershipStatus.bind(
      //     collectiblesController,
      //   ),

      // isCollectibleOwner: collectiblesController.isCollectibleOwner.bind(
      //   collectiblesController,
      // ),

      // // AddressController
      // setAddressBook: addressBookController.set.bind(addressBookController),
      // removeFromAddressBook: addressBookController.delete.bind(
      //   addressBookController,
      // ),

      // // AppStateController
      // setLastActiveTime:
      //   appStateController.setLastActiveTime.bind(appStateController),
      // setDefaultHomeActiveTabName:
      //   appStateController.setDefaultHomeActiveTabName.bind(appStateController),
      // setConnectedStatusPopoverHasBeenShown:
      //   appStateController.setConnectedStatusPopoverHasBeenShown.bind(
      //     appStateController,
      //   ),
      // setRecoveryPhraseReminderHasBeenShown:
      //   appStateController.setRecoveryPhraseReminderHasBeenShown.bind(
      //     appStateController,
      //   ),
      // setRecoveryPhraseReminderLastShown:
      //   appStateController.setRecoveryPhraseReminderLastShown.bind(
      //     appStateController,
      //   ),
      // setShowTestnetMessageInDropdown:
      //   appStateController.setShowTestnetMessageInDropdown.bind(
      //     appStateController,
      //   ),
      // setCollectiblesDetectionNoticeDismissed:
      //   appStateController.setCollectiblesDetectionNoticeDismissed.bind(
      //     appStateController,
      //   ),
      // setEnableEIP1559V2NoticeDismissed:
      //   appStateController.setEnableEIP1559V2NoticeDismissed.bind(
      //     appStateController,
      //   ),
      // updateCollectibleDropDownState:
      //   appStateController.updateCollectibleDropDownState.bind(
      //     appStateController,
      //   ),
      // // EnsController
      // tryReverseResolveAddress:
      //   ensController.reverseResolveAddress.bind(ensController),

      // KeyringController
      // setLocked: this.setLocked.bind(this),
      createNewVaultAndKeychain: this.createNewVaultAndKeychain.bind(this),
      createNewVaultAndRestore: this.createNewVaultAndRestore.bind(this),
      exportAccount: keyringController.exportAccount.bind(keyringController),

      // // txController
      // cancelTransaction: txController.cancelTransaction.bind(txController),
      // updateTransaction: txController.updateTransaction.bind(txController),
      // updateAndApproveTransaction:
      //   txController.updateAndApproveTransaction.bind(txController),
      // approveTransactionsWithSameNonce:
      //   txController.approveTransactionsWithSameNonce.bind(txController),
      // createCancelTransaction: this.createCancelTransaction.bind(this),
      // createSpeedUpTransaction: this.createSpeedUpTransaction.bind(this),
      // estimateGas: this.estimateGas.bind(this),
      // getNextNonce: this.getNextNonce.bind(this),
      // addUnapprovedTransaction:
      //   txController.addUnapprovedTransaction.bind(txController),
      // createTransactionEventFragment:
      //   txController.createTransactionEventFragment.bind(txController),
      // getTransactions: txController.getTransactions.bind(txController),

      // updateEditableParams:
      //   txController.updateEditableParams.bind(txController),
      // updateTransactionGasFees:
      //   txController.updateTransactionGasFees.bind(txController),
      // updateTransactionSendFlowHistory:
      //   txController.updateTransactionSendFlowHistory.bind(txController),

      // updateSwapApprovalTransaction:
      //   txController.updateSwapApprovalTransaction.bind(txController),
      // updateSwapTransaction:
      //   txController.updateSwapTransaction.bind(txController),

      // updatePreviousGasParams:
      //   txController.updatePreviousGasParams.bind(txController),
      // // messageManager
      // signMessage: this.signMessage.bind(this),
      // cancelMessage: this.cancelMessage.bind(this),

      // // personalMessageManager
      // signPersonalMessage: this.signPersonalMessage.bind(this),
      // cancelPersonalMessage: this.cancelPersonalMessage.bind(this),

      // // typedMessageManager
      // signTypedMessage: this.signTypedMessage.bind(this),
      // cancelTypedMessage: this.cancelTypedMessage.bind(this),

      // // decryptMessageManager
      // decryptMessage: this.decryptMessage.bind(this),
      // decryptMessageInline: this.decryptMessageInline.bind(this),
      // cancelDecryptMessage: this.cancelDecryptMessage.bind(this),

      // // EncryptionPublicKeyManager
      // encryptionPublicKey: this.encryptionPublicKey.bind(this),
      // cancelEncryptionPublicKey: this.cancelEncryptionPublicKey.bind(this),

      // // onboarding controller
      // setSeedPhraseBackedUp:
      //   onboardingController.setSeedPhraseBackedUp.bind(onboardingController),
      // completeOnboarding:
      //   onboardingController.completeOnboarding.bind(onboardingController),
      // setFirstTimeFlowType:
      //   onboardingController.setFirstTimeFlowType.bind(onboardingController),

      // // alert controller
      // setAlertEnabledness:
      //   alertController.setAlertEnabledness.bind(alertController),
      // setUnconnectedAccountAlertShown:
      //   alertController.setUnconnectedAccountAlertShown.bind(alertController),
      // setWeb3ShimUsageAlertDismissed:
      //   alertController.setWeb3ShimUsageAlertDismissed.bind(alertController),

      // // 3Box
      // setThreeBoxSyncingPermission:
      //   threeBoxController.setThreeBoxSyncingPermission.bind(
      //     threeBoxController,
      //   ),
      // restoreFromThreeBox:
      //   threeBoxController.restoreFromThreeBox.bind(threeBoxController),
      // setShowRestorePromptToFalse:
      //   threeBoxController.setShowRestorePromptToFalse.bind(threeBoxController),
      // getThreeBoxLastUpdated:
      //   threeBoxController.getLastUpdated.bind(threeBoxController),
      // turnThreeBoxSyncingOn:
      //   threeBoxController.turnThreeBoxSyncingOn.bind(threeBoxController),
      // initializeThreeBox: this.initializeThreeBox.bind(this),

      // // permissions
      // removePermissionsFor:
      //   permissionController.revokePermissions.bind(permissionController),
      // approvePermissionsRequest:
      //   permissionController.acceptPermissionsRequest.bind(
      //     permissionController,
      //   ),
      // rejectPermissionsRequest:
      //   permissionController.rejectPermissionsRequest.bind(
      //     permissionController,
      //   ),
      // ...getPermissionBackgroundApiMethods(permissionController),

      // ///: BEGIN:ONLY_INCLUDE_IN(flask)
      // // snaps
      // removeSnapError: this.snapController.removeSnapError.bind(
      //   this.snapController,
      // ),
      // disableSnap: this.snapController.disableSnap.bind(this.snapController),
      // enableSnap: this.snapController.enableSnap.bind(this.snapController),
      // removeSnap: this.snapController.removeSnap.bind(this.snapController),
      // dismissNotifications: this.dismissNotifications.bind(this),
      // markNotificationsAsRead: this.markNotificationsAsRead.bind(this),
      // ///: END:ONLY_INCLUDE_IN

      // // swaps
      // fetchAndSetQuotes:
      //   swapsController.fetchAndSetQuotes.bind(swapsController),
      // setSelectedQuoteAggId:
      //   swapsController.setSelectedQuoteAggId.bind(swapsController),
      // resetSwapsState: swapsController.resetSwapsState.bind(swapsController),
      // setSwapsTokens: swapsController.setSwapsTokens.bind(swapsController),
      // clearSwapsQuotes: swapsController.clearSwapsQuotes.bind(swapsController),
      // setApproveTxId: swapsController.setApproveTxId.bind(swapsController),
      // setTradeTxId: swapsController.setTradeTxId.bind(swapsController),
      // setSwapsTxGasPrice:
      //   swapsController.setSwapsTxGasPrice.bind(swapsController),
      // setSwapsTxGasLimit:
      //   swapsController.setSwapsTxGasLimit.bind(swapsController),
      // setSwapsTxMaxFeePerGas:
      //   swapsController.setSwapsTxMaxFeePerGas.bind(swapsController),
      // setSwapsTxMaxFeePriorityPerGas:
      //   swapsController.setSwapsTxMaxFeePriorityPerGas.bind(swapsController),
      // safeRefetchQuotes:
      //   swapsController.safeRefetchQuotes.bind(swapsController),
      // stopPollingForQuotes:
      //   swapsController.stopPollingForQuotes.bind(swapsController),
      // setBackgroundSwapRouteState:
      //   swapsController.setBackgroundSwapRouteState.bind(swapsController),
      // resetPostFetchState:
      //   swapsController.resetPostFetchState.bind(swapsController),
      // setSwapsErrorKey: swapsController.setSwapsErrorKey.bind(swapsController),
      // setInitialGasEstimate:
      //   swapsController.setInitialGasEstimate.bind(swapsController),
      // setCustomApproveTxData:
      //   swapsController.setCustomApproveTxData.bind(swapsController),
      // setSwapsLiveness: swapsController.setSwapsLiveness.bind(swapsController),
      // setSwapsFeatureFlags:
      //   swapsController.setSwapsFeatureFlags.bind(swapsController),
      // setSwapsUserFeeLevel:
      //   swapsController.setSwapsUserFeeLevel.bind(swapsController),
      // setSwapsQuotesPollingLimitEnabled:
      //   swapsController.setSwapsQuotesPollingLimitEnabled.bind(swapsController),

      // // Smart Transactions
      // setSmartTransactionsOptInStatus:
      //   smartTransactionsController.setOptInState.bind(
      //     smartTransactionsController,
      //   ),
      // fetchSmartTransactionFees: smartTransactionsController.getFees.bind(
      //   smartTransactionsController,
      // ),
      // submitSignedTransactions:
      //   smartTransactionsController.submitSignedTransactions.bind(
      //     smartTransactionsController,
      //   ),
      // cancelSmartTransaction:
      //   smartTransactionsController.cancelSmartTransaction.bind(
      //     smartTransactionsController,
      //   ),
      // fetchSmartTransactionsLiveness:
      //   smartTransactionsController.fetchLiveness.bind(
      //     smartTransactionsController,
      //   ),
      // updateSmartTransaction:
      //   smartTransactionsController.updateSmartTransaction.bind(
      //     smartTransactionsController,
      //   ),
      // setStatusRefreshInterval:
      //   smartTransactionsController.setStatusRefreshInterval.bind(
      //     smartTransactionsController,
      //   ),

      // // MetaMetrics
      // trackMetaMetricsEvent: metaMetricsController.trackEvent.bind(
      //   metaMetricsController,
      // ),
      // trackMetaMetricsPage: metaMetricsController.trackPage.bind(
      //   metaMetricsController,
      // ),
      // createEventFragment: metaMetricsController.createEventFragment.bind(
      //   metaMetricsController,
      // ),
      // updateEventFragment: metaMetricsController.updateEventFragment.bind(
      //   metaMetricsController,
      // ),
      // finalizeEventFragment: metaMetricsController.finalizeEventFragment.bind(
      //   metaMetricsController,
      // ),

      // // approval controller
      // resolvePendingApproval:
      //   approvalController.accept.bind(approvalController),
      // rejectPendingApproval: async (id, error) => {
      //   approvalController.reject(
      //     id,
      //     new EthereumRpcError(error.code, error.message, error.data),
      //   );
      // },

      // // Notifications
      // updateViewedNotifications: announcementController.updateViewed.bind(
      //   announcementController,
      // ),

      // // GasFeeController
      // getGasFeeEstimatesAndStartPolling:
      //   gasFeeController.getGasFeeEstimatesAndStartPolling.bind(
      //     gasFeeController,
      //   ),

      // disconnectGasFeeEstimatePoller:
      //   gasFeeController.disconnectPoller.bind(gasFeeController),

      // getGasFeeTimeEstimate:
      //   gasFeeController.getTimeEstimate.bind(gasFeeController),

      // addPollingTokenToAppState:
      //   appStateController.addPollingToken.bind(appStateController),

      // removePollingTokenFromAppState:
      //   appStateController.removePollingToken.bind(appStateController),

      // // DetectTokenController
      // detectNewTokens: detectTokensController.detectNewTokens.bind(
      //   detectTokensController,
      // ),

      // // DetectCollectibleController
      // detectCollectibles: process.env.COLLECTIBLES_V1
      //   ? collectibleDetectionController.detectCollectibles.bind(
      //       collectibleDetectionController,
      //     )
      //   : null,

      // /** Token Detection V2 */
      // addDetectedTokens: process.env.TOKEN_DETECTION_V2
      //   ? tokensController.addDetectedTokens.bind(tokensController)
      //   : null,
      // importTokens: process.env.TOKEN_DETECTION_V2
      //   ? tokensController.importTokens.bind(tokensController)
      //   : null,
      // ignoreTokens: process.env.TOKEN_DETECTION_V2
      //   ? tokensController.ignoreTokens.bind(tokensController)
      //   : null,
      // getBalancesInSingleCall: process.env.TOKEN_DETECTION_V2
      //   ? assetsContractController.getBalancesInSingleCall.bind(
      //       assetsContractController,
      //     )
      //   : null,
    };
  }

  /**
   * A method for providing our API over a stream using JSON-RPC.
   *
   * @param {*} outStream - The stream to provide our API over.
   */
  setupControllerConnection(outStream: any) {
    const api = this.getApi();

    // report new active controller connection
    this.activeControllerConnections += 1;
    this.emit('controllerConnectionChanged', this.activeControllerConnections);

    // set up postStream transport
    outStream.on('data', createMetaRPCHandler(api, outStream));
    const handleUpdate = (update: any) => {
      if (outStream._writableState.ended) {
        return;
      }
      // send notification to client-side
      outStream.write({
        jsonrpc: '2.0',
        method: 'sendUpdate',
        params: [update],
      });
    };
    this.on('update', handleUpdate);
    outStream.on('end', () => {
      this.activeControllerConnections -= 1;
      this.emit(
        'controllerConnectionChanged',
        this.activeControllerConnections,
      );
      this.removeListener('update', handleUpdate);
    });
  }

  /**
   * A method for serving our ethereum provider over a given stream.
   *
   * @param {*} outStream - The stream to provide over.
   * @param {MessageSender | SnapSender} sender - The sender of the messages on this stream
   * @param {string} subjectType - The type of the sender, i.e. subject.
   */
  setupProviderConnection(outStream: any, sender: any, subjectType: any) {
    console.log('setupProviderConnection', outStream, sender, subjectType);
    // let origin: any;
    // if (subjectType === SUBJECT_TYPES.INTERNAL) {
    //   origin = ORIGIN_METAMASK;
    // }
    // ///: BEGIN:ONLY_INCLUDE_IN(flask)
    // else if (subjectType === SUBJECT_TYPES.SNAP) {
    //   origin = sender.snapId;
    // }
    // ///: END:ONLY_INCLUDE_IN
    // else {
    //   origin = new URL(sender.url).origin;
    // }

    // if (sender.id && sender.id !== this.extension.runtime.id) {
    //   this.subjectMetadataController.addSubjectMetadata({
    //     origin,
    //     extensionId: sender.id,
    //     subjectType: SUBJECT_TYPES.EXTENSION,
    //   });
    // }

    // let tabId;
    // if (sender.tab && sender.tab.id) {
    //   tabId = sender.tab.id;
    // }

    // const engine = this.setupProviderEngine({
    //   origin,
    //   sender,
    //   subjectType,
    //   tabId,
    // });

    // // setup connection
    // const providerStream = createEngineStream({ engine });

    // const connectionId = this.addConnection(origin, { engine });

    // pump(outStream, providerStream, outStream, (err) => {
    //   // handle any middleware cleanup
    //   engine._middleware.forEach((mid) => {
    //     if (mid.destroy && typeof mid.destroy === 'function') {
    //       mid.destroy();
    //     }
    //   });
    //   connectionId && this.removeConnection(origin, connectionId);
    //   if (err) {
    //     log.error(err);
    //   }
    // });
  }

  /**
   * Used to create a multiplexed stream for connecting to a trusted context,
   * like our own user interfaces, which have the provider APIs, but also
   * receive the exported API from this controller, which includes trusted
   * functions, like the ability to approve transactions or sign messages.
   *
   * @param {*} connectionStream - The duplex stream to connect to.
   * @param {MessageSender} sender - The sender of the messages on this stream
   */
  setupTrustedCommunication(connectionStream: any, sender: any) {
    // setup multiplexing
    const mux = setupMultiplex(connectionStream);
    // connect features
    this.setupControllerConnection(mux.createStream('controller'));
    this.setupProviderConnection(
      mux.createStream('provider'),
      sender,
      SUBJECT_TYPES.INTERNAL,
    );
  }
}
