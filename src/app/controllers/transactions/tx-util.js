import { BN, addHexPrefix, stripHexPrefix } from 'ethereumjs-util';

export const normalizers = {
  from: addHexPrefix,
  to: (to, lowerCase) =>
    lowerCase ? addHexPrefix(to).toLowerCase() : addHexPrefix(to),
  nonce: addHexPrefix,
  value: addHexPrefix,
  data: addHexPrefix,
  gas: addHexPrefix,
  gasPrice: addHexPrefix,
  maxFeePerGas: addHexPrefix,
  maxPriorityFeePerGas: addHexPrefix,
  type: addHexPrefix,
  estimateSuggested: (estimate) => estimate,
  estimateUsed: (estimate) => estimate,
};

/**
 * Normalizes the given txParams
 *
 * @param {Object} txParams - The transaction params
 * @param {boolean} [lowerCase] - Whether to lowercase the 'to' address.
 * Default: true
 * @returns {Object} the normalized tx params
 */
export function normalizeTxParams(txParams, lowerCase = true) {
  // apply only keys in the normalizers
  const normalizedTxParams = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const key in normalizers) {
    if (txParams[key]) {
      normalizedTxParams[key] = normalizers[key](txParams[key], lowerCase);
    }
  }
  return normalizedTxParams;
}

/**
 * Converts a hex string to a BN object
 *
 * @param {string} inputHex - A number represented as a hex string
 * @returns {Object} A BN object
 */
export function hexToBn(inputHex) {
  return new BN(stripHexPrefix(inputHex), 16);
}

/**
 * Used to multiply a BN by a fraction
 *
 * @param {BN} targetBN - The number to multiply by a fraction
 * @param {number|string} numerator - The numerator of the fraction multiplier
 * @param {number|string} denominator - The denominator of the fraction multiplier
 * @returns {BN} The product of the multiplication
 */
export function BnMultiplyByFraction(targetBN, numerator, denominator) {
  const numBN = new BN(numerator);
  const denomBN = new BN(denominator);
  return targetBN.mul(numBN).div(denomBN);
}
