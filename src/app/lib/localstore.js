import { isEmpty } from 'lodash';
import browser from 'webextension-polyfill';

/**
 * Returns an Error if extension.runtime.lastError is present
 * this is a workaround for the non-standard error object that's used
 *
 * @returns {Error|undefined}
 */
export function checkForError() {
  const { lastError } = browser.runtime;
  if (!lastError) {
    return undefined;
  }
  // if it quacks like an Error, its an Error
  if (lastError.stack && lastError.message) {
    return lastError;
  }
  // repair incomplete error object (eg chromium v77)
  return new Error(lastError.message);
}

/**
 * A wrapper around the extension's storage local API
 */
class ExtensionStore {
  constructor() {
    this.isSupported = Boolean(browser.storage.local);
    if (!this.isSupported) {
      console.log('Storage local API not available.');
    }
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
    return new Promise((resolve, reject) => {
      // if key is null, get all storage data
      local.get(key).then((/** @type {any} */ result) => {
        const err = checkForError();
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
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
    return new Promise((resolve, reject) => {
      local.set(obj).then(() => {
        const err = checkForError();
        if (err) {
          reject(err);
        } else {
          resolve(null);
        }
      });
    });
  }
}

export default ExtensionStore;
