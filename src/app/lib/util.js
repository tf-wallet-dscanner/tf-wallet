import { BN, addHexPrefix, bufferToHex, toBuffer } from 'ethereumjs-util';
import { fromWei, toWei } from 'ethjs-unit';
import { memoize } from 'lodash';
import Web3 from 'web3';

import {
  ENVIRONMENT_TYPE_BACKGROUND,
  ENVIRONMENT_TYPE_NOTIFICATION,
  ENVIRONMENT_TYPE_POPUP,
} from '../constants/app';

/**
 * @see {@link getEnvironmentType}
 */
export const getEnvironmentTypeMemo = memoize((url) => {
  const parsedUrl = new URL(url);
  if (parsedUrl.pathname === '/popup.html') {
    return ENVIRONMENT_TYPE_POPUP;
  } else if (parsedUrl.pathname === '/notification.html') {
    return ENVIRONMENT_TYPE_NOTIFICATION;
  }
  return ENVIRONMENT_TYPE_BACKGROUND;
});

/**
 * Returns the window type for the application
 *
 *  - `popup` refers to the extension opened through the browser app icon (in top right corner in chrome and firefox)
 *  - `fullscreen` refers to the main browser window
 *  - `notification` refers to the popup that appears in its own window when taking action outside of metamask
 *  - `background` refers to the background page
 *
 * NOTE: This should only be called on internal URLs.
 *
 * @param {string} [url] - the URL of the window
 * @returns {string} the environment ENUM
 */
export const getEnvironmentType = (url = window.location.href) =>
  getEnvironmentTypeMemo(url);

// address 앞에 0x로 시작하면 2자리 자르기
export function stripHexPrefix(address) {
  if (address.startsWith('0x')) {
    return address.slice(2);
  }
  return address;
}

// 정규화
export function normalize(input) {
  if (!input) {
    return undefined;
  }
  if (typeof input === 'number') {
    const buffer = toBuffer(input);
    input = bufferToHex(buffer);
  }
  if (typeof input !== 'string') {
    let msg = 'eth-sig-util.normalize() requires hex string or integer input.';
    msg += ` received ${typeof input}: ${input}`;
    throw new Error(msg);
  }
  return addHexPrefix(input.toLowerCase());
}

/**
 * Used to convert a base-10 number from GWEI to WEI. Can handle numbers with decimal parts.
 *
 * @param {number | string}n - The base 10 number to convert to WEI.
 * @returns The number in WEI, as a BN.
 */
export function gweiDecToWEIBN(n) {
  if (Number.isNaN(n)) {
    return new BN(0);
  }

  const parts = n.toString().split('.');
  const wholePart = parts[0] || '0';
  let decimalPart = parts[1] || '';

  if (!decimalPart) {
    return toWei(wholePart, 'gwei');
  }

  if (decimalPart.length <= 9) {
    return toWei(`${wholePart}.${decimalPart}`, 'gwei');
  }

  const decimalPartToRemove = decimalPart.slice(9);
  const decimalRoundingDigit = decimalPartToRemove[0];

  decimalPart = decimalPart.slice(0, 9);
  let wei = toWei(`${wholePart}.${decimalPart}`, 'gwei');

  if (Number(decimalRoundingDigit) >= 5) {
    wei = wei.add(new BN(1));
  }

  return wei;
}

/**
 * Used to convert a base-10 number from GWEI to WEI. Can handle numbers with decimal parts.
 *
 * @param {number | string}n - The base 10 number to convert to WEI.
 * @returns The number in WEI, as a BN.
 */
export function gweiDecToETHDec(n) {
  if (Number.isNaN(n)) {
    return new BN(0);
  }

  const parts = n.toString().split('.');
  const wholePart = parts[0] || '0';

  const eth = parseInt(wholePart, 10) / 10 ** 9;

  return eth;
}

/**
 * Used to convert values from wei hex format to dec gwei format.
 *
 * @param {string}hex - The value in hex wei.
 * @returns The value in dec gwei as string.
 */
export function weiHexToGweiDec(hex) {
  const hexWei = new BN(stripHexPrefix(hex), 16);
  return fromWei(hexWei, 'gwei').toString(10);
}

/**
 * Execute and return an asynchronous operation without throwing errors.
 *
 * @param {() => Promise<any>} operation - Function returning a Promise.
 * @param {boolean} logError - Determines if the error should be logged.
 * @returns Promise resolving to the result of the async operation.
 */
export async function safelyExecute(operation, logError = false) {
  try {
    return await operation();
  } catch (error) {
    /* istanbul ignore next */
    if (logError) {
      console.error(error);
    }
    return undefined;
  }
}

/**
 * Execute and return an asynchronous operation with a timeout.
 *
 * @param {() => Promise<any>} operation - Function returning a Promise.
 * @param {boolean} logError - Determines if the error should be logged.
 * @param {number} timeout - Timeout to fail the operation.
 * @returns Promise resolving to the result of the async operation.
 */
export async function safelyExecuteWithTimeout(
  operation,
  logError = false,
  timeout = 500,
) {
  try {
    return await Promise.race([
      operation(),
      new Promise((_, reject) =>
        // eslint-disable-next-line no-promise-executor-return
        setTimeout(() => {
          reject(new Error('timeout'));
        }, timeout),
      ),
    ]);
  } catch (error) {
    /* istanbul ignore next */
    if (logError) {
      console.error(error);
    }
    return undefined;
  }
}

/**
 * Used to convert values from wei hex format to dec eth format.
 *
 * @param {string}hex - The value in hex wei.
 * @returns The value in dec eth as string.
 */
export function weiHexToEthDec(hex) {
  return Web3.utils.fromWei(hex.toString(), 'ether');
}

/**
 * Checks if the given string is an address
 *
 * @param {string}address - address the given HEX adress
 * @returns {Boolean}
 */
export function isAddress(address) {
  return Web3.utils.isAddress(address);
}

export const makeCorrectNumber = (n) => {
  return Math.round(n * 1e12) / 1e12;
};
