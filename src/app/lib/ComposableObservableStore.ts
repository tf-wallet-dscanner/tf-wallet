import { ObservableStore } from '@metamask/obs-store';
import { getPersistentState } from '@metamask/controllers';

/**
 * @typedef {import('@metamask/controllers').ControllerMessenger} ControllerMessenger
 */

interface ComposableObservableStoreOptions {
  config: any;
  controllerMessenger: any;
  state: any;
  persist: any;
}

/**
 * An ObservableStore that can composes a flat
 * structure of child stores based on configuration
 */
export default class ComposableObservableStore extends ObservableStore<any> {
  /**
   * Describes which stores are being composed. The key is the name of the
   * store, and the value is either an ObserableStore, or a controller that
   * extends one of the two base controllers in the `@metamask/controllers`
   * package.
   *
   * @type {Record<string, Object>}
   */
  config: any;

  private persist;

  private controllerMessenger;

  /**
   * Create a new store
   *
   * @param {Object} options
   * @param {Object} [options.config] - Map of internal state keys to child stores
   * @param {ControllerMessenger} options.controllerMessenger - The controller
   *   messenger, used for subscribing to events from BaseControllerV2-based
   *   controllers.
   * @param {Object} [options.state] - The initial store state
   * @param {boolean} [options.persist] - Whether or not to apply the persistence for v2 controllers
   */
  constructor({
    config,
    controllerMessenger,
    state,
    persist,
  }: ComposableObservableStoreOptions) {
    super(state);
    this.persist = persist;
    this.controllerMessenger = controllerMessenger;
    if (config) {
      this.updateStructure(config);
    }
  }

  /**
   * Composes a new internal store subscription structure
   *
   * @param {Record<string, Object>} config - Describes which stores are being
   *   composed. The key is the name of the store, and the value is either an
   *   ObserableStore, or a controller that extends one of the two base
   *   controllers in the `@metamask/controllers` package.
   */
  updateStructure(config: any) {
    this.config = config;
    super.removeAllListeners();
    for (const key of Object.keys(config)) {
      if (!config[key]) {
        throw new Error(`Undefined '${key}'`);
      }
      const store = config[key];
      if (store.subscribe) {
        config[key].subscribe((state: any) => {
          super.updateState({ [key]: state });
        });
      } else {
        this.controllerMessenger.subscribe(
          `${store.name}:stateChange`,
          (state: any) => {
            let updatedState = state;
            if (this.persist) {
              updatedState = getPersistentState(state, config[key].metadata);
            }
            super.updateState({ [key]: updatedState });
          },
        );
      }
    }
  }

  /**
   * Merges all child store state into a single object rather than
   * returning an object keyed by child store class name
   *
   * @returns {Object} Object containing merged child store state
   */
  getFlatState() {
    if (!this.config) {
      return {};
    }
    let flatState = {};
    for (const key of Object.keys(this.config)) {
      const controller = this.config[key];
      const state = controller.getState
        ? controller.getState()
        : controller.state;
      flatState = { ...flatState, ...state };
    }
    return flatState;
  }
}
