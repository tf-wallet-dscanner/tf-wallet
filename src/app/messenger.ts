import { browser } from 'webextension-polyfill-ts';

import { BackgroundMessages, ContentScriptMessages } from './messages';

const Messenger = {
  /**
   * Send a message to Background script
   *
   * @param {BackgroundMessage} type Background Message Type
   * @param {*} [data]
   * @return {*}
   */
  async sendMessageToBackground(type: BackgroundMessages, data: any) {
    try {
      const response = await browser.runtime.sendMessage({ type, data });
      return response;
    } catch (error) {
      console.error('sendMessageToBackground error: ', error);
      return null;
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
  async sendMessageToContentScript(
    tabID: number,
    type: ContentScriptMessages,
    data: any,
  ) {
    try {
      const response = await browser.tabs.sendMessage(tabID, { type, data });
      return response;
    } catch (error) {
      console.error('sendMessageToContentScript error: ', error);
      return null;
    }
  },
};

export default Messenger;
