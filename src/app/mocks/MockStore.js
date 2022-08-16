import { isEmpty } from 'lodash';

// webextension-polyfill storage mocking
const browser = {
  storage: {
    local: {
      get(key) {
        if (key === null) {
          return Promise.resolve(this.data);
        }
        return Promise.resolve(this.data[key]);
      },
      set(obj) {
        Object.assign(this.data, obj);
        return Promise.resolve(null);
      },
      data: {},
    },
  },
};

class MockStore {
  constructor() {
    this.isSupported = true;
  }

  /**
   * Returns all of the keys currently saved
   *
   * @returns {Promise<*>}
   */
  async getAll() {
    if (!this.isSupported) {
      return undefined;
    }
    const result = await this.#get(null);
    if (isEmpty(result)) {
      return undefined;
    }
    return result;
  }

  /**
   * Returns all of the keys currently saved
   *
   * @param {Object} key - the key
   * @returns {Promise<*>}
   */
  async get(key) {
    if (!this.isSupported) {
      return undefined;
    }
    const result = await this.#get([key]);
    if (isEmpty(result)) {
      return undefined;
    }
    return result;
  }

  /**
   * Sets the key in local state
   *
   * @param {Object} state - The state to set
   * @returns {Promise<void>}
   */
  async set(state) {
    return this.#set(state);
  }

  /**
   * Returns keys(all) currently saved
   *
   * @private
   * @returns {Object} the key-value map from local storage
   */
  #get(key) {
    const { local } = browser.storage;
    return new Promise((resolve) => {
      // if key is null, get all storage data
      local.get(key).then((/** @type {any} */ result) => {
        resolve(result);
      });
    });
  }

  /**
   * Sets the key in local state
   *
   * @param {Object} obj - The key to set
   * @returns {Promise<void>}
   * @private
   */
  #set(obj) {
    const { local } = browser.storage;
    return new Promise((resolve) => {
      local.set(obj).then(() => {
        resolve(null);
      });
    });
  }
}

export default MockStore;
