import { addHexPrefix } from 'ethereumjs-util';

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
