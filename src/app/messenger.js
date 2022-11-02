import browser from 'webextension-polyfill';

const Messenger = {
  /**
   * Send a message to Background script
   *
   * @param {BackgroundMessage} type Background Message Type
   * @param {*} [data]
   * @return {*}
   */
  async sendMessageToBackground(type, data) {
    try {
      const response = await browser.runtime.sendMessage({ type, data });
      return response;
    } catch (error) {
      throw new Error(`sendMessageToBackground error: ${error.message}`);
    }
  },

  /**
   * Send a message to Content Script of a Tab
   *
   * @param {number} tabID Tab ID
   * @param {ContentScriptMessage} type
   * @param {*} [data]
   * @return {*}
   */
  async sendMessageToContentScript(tabID, type, data) {
    try {
      const response = await browser.tabs.sendMessage(tabID, { type, data });
      return response;
    } catch (error) {
      throw new Error(`sendMessageToContentScript error: ${error.message}`);
    }
  },
};

export default Messenger;
