import { getBlockExplorerLink } from '@metamask/etherscan-link';
import browser from 'webextension-polyfill';

import { ENVIRONMENT_TYPE_BACKGROUND } from '../../shared/constants/app';
// import { TRANSACTION_STATUSES } from '../../shared/constants/transaction';
import { checkForError, getEnvironmentType } from '../lib/util';

export default class ExtensionPlatform {
  //
  // Public
  //
  reload() {
    browser.runtime.reload();
  }

  openTab(options: any) {
    return new Promise((resolve, reject) => {
      browser.tabs.create(options).then((newTab) => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(newTab);
      });
    });
  }

  openWindow(options: any) {
    return new Promise((resolve, reject) => {
      browser.windows.create(options).then((newWindow) => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(newWindow);
      });
    });
  }

  focusWindow(windowId: any) {
    return new Promise((resolve, reject) => {
      browser.windows.update(windowId, { focused: true }).then(() => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve('');
      });
    });
  }

  updateWindowPosition(windowId: any, left: any, top: any) {
    return new Promise((resolve, reject) => {
      browser.windows.update(windowId, { left, top }).then(() => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve('');
      });
    });
  }

  getLastFocusedWindow() {
    return new Promise((resolve, reject) => {
      browser.windows.getLastFocused().then((windowObject) => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(windowObject);
      });
    });
  }

  closeCurrentWindow() {
    return browser.windows.getCurrent().then((windowDetails) => {
      return browser.windows.remove(windowDetails.id as any);
    });
  }

  getVersion() {
    const { version, version_name: versionName } =
      browser.runtime.getManifest();

    const versionParts = version.split('.');
    if (versionName) {
      if (versionParts.length < 4) {
        throw new Error(`Version missing build number: '${version}'`);
      }
      // On Chrome, a more descriptive representation of the version is stored in the
      // `version_name` field for display purposes. We use this field instead of the `version`
      // field on Chrome for non-main builds (i.e. Flask, Beta) because we want to show the
      // version in the SemVer-compliant format "v[major].[minor].[patch]-[build-type].[build-number]",
      // yet Chrome does not allow letters in the `version` field.
      return versionName;
      // A fourth version part is sometimes present for "rollback" Chrome builds
    } else if (![3, 4].includes(versionParts.length)) {
      throw new Error(`Invalid version: ${version}`);
    } else if (versionParts[2].match(/[^\d]/u)) {
      // On Firefox, the build type and build version are in the third part of the version.
      const [major, minor, patchAndPrerelease] = versionParts;
      const matches = patchAndPrerelease.match(/^(\d+)([A-Za-z]+)(\d)+$/u);
      if (matches === null) {
        throw new Error(`Version contains invalid prerelease: ${version}`);
      }
      const [, patch, buildType, buildVersion] = matches;
      return `${major}.${minor}.${patch}-${buildType}.${buildVersion}`;
    }

    // If there is no `version_name` and there are only 3 or 4 version parts, then this is not a
    // prerelease and the version requires no modification.
    return version;
  }

  openExtensionInBrowser(
    route = null,
    queryString = null,
    keepWindowOpen = false,
  ) {
    let extensionURL = browser.runtime.getURL('home.html');

    if (route) {
      extensionURL += `#${route}`;
    }

    if (queryString) {
      extensionURL += `?${queryString}`;
    }

    this.openTab({ url: extensionURL });
    if (
      getEnvironmentType() !== ENVIRONMENT_TYPE_BACKGROUND &&
      !keepWindowOpen
    ) {
      window.close();
    }
  }

  getPlatformInfo(cb: any) {
    try {
      const platformInfo = browser.runtime.getPlatformInfo();
      cb(platformInfo);
      return;
    } catch (e) {
      cb(e);
      // eslint-disable-next-line no-useless-return
      return;
    }
  }

  // showTransactionNotification(txMeta: any, rpcPrefs: any) {
  //   const { status, txReceipt: { status: receiptStatus } = {} as any } = txMeta;

  //   if (status === TRANSACTION_STATUSES.CONFIRMED) {
  //     // There was an on-chain failure
  //     receiptStatus === '0x0'
  //       ? this._showFailedTransaction(
  //           txMeta,
  //           'Transaction encountered an error.',
  //         )
  //       : this._showConfirmedTransaction(txMeta, rpcPrefs);
  //   } else if (status === TRANSACTION_STATUSES.FAILED) {
  //     this._showFailedTransaction(txMeta);
  //   }
  // }

  addOnRemovedListener(listener: any) {
    browser.windows.onRemoved.addListener(listener);
  }

  getAllWindows() {
    return new Promise((resolve, reject) => {
      browser.windows.getAll().then((windows) => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(windows);
      });
    });
  }

  getActiveTabs() {
    return new Promise((resolve, reject) => {
      browser.tabs.query({ active: true }).then((tabs) => {
        const error = checkForError();
        if (error) {
          return reject(error);
        }
        return resolve(tabs);
      });
    });
  }

  currentTab() {
    return new Promise((resolve, reject) => {
      browser.tabs.getCurrent().then((tab) => {
        const err = checkForError();
        if (err) {
          reject(err);
        } else {
          resolve(tab);
        }
      });
    });
  }

  switchToTab(tabId: any) {
    return new Promise((resolve, reject) => {
      browser.tabs.update(tabId, { highlighted: true }).then((tab) => {
        const err = checkForError();
        if (err) {
          reject(err);
        } else {
          resolve(tab);
        }
      });
    });
  }

  closeTab(tabId: any) {
    return new Promise((resolve, reject) => {
      browser.tabs.remove(tabId).then(() => {
        const err = checkForError();
        if (err) {
          reject(err);
        } else {
          resolve('');
        }
      });
    });
  }

  _showConfirmedTransaction(txMeta: any, rpcPrefs: any) {
    this._subscribeToNotificationClicked();

    const url = getBlockExplorerLink(txMeta, rpcPrefs);
    const nonce = parseInt(txMeta.txParams.nonce, 16);

    const title = 'Confirmed transaction';
    const message = `Transaction ${nonce} confirmed! ${
      url.length ? 'View on Etherscan' : ''
    }`;
    this._showNotification(title, message, url);
  }

  _showFailedTransaction(txMeta: any, errorMessage?: any) {
    const nonce = parseInt(txMeta.txParams.nonce, 16);
    const title = 'Failed transaction';
    const message = `Transaction ${nonce} failed! ${
      errorMessage || txMeta.err.message
    }`;
    this._showNotification(title, message);
  }

  _showNotification(title: any, message: any, url?: any) {
    browser.notifications.create(url, {
      type: 'basic',
      title,
      iconUrl: browser.runtime.getURL('../../images/icon-64.png'),
      message,
    });
  }

  _subscribeToNotificationClicked() {
    if (!browser.notifications.onClicked.hasListener(this._viewOnEtherscan)) {
      browser.notifications.onClicked.addListener(this._viewOnEtherscan);
    }
  }

  _viewOnEtherscan(url: any) {
    if (url.startsWith('https://')) {
      browser.tabs.create({ url });
    }
  }
}
