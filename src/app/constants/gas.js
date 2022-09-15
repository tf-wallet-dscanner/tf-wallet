import { addHexPrefix } from 'ethereumjs-util';

/**
 * Indicates which type of gasEstimate the controller is currently returning.
 * This is useful as a way of asserting that the shape of gasEstimates matches
 * expectations. NONE is a special case indicating that no previous gasEstimate
 * has been fetched.
 */
export const GAS_ESTIMATE_TYPES = {
  FEE_MARKET: 'fee-market',
  LEGACY: 'legacy',
  ETH_GASPRICE: 'eth_gasPrice',
  NONE: 'none',
};
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const GAS_API_BASE_URL = 'https://gas-api.metaswap.codefi.network';
export const GAS_DEV_API_BASE_URL =
  'https://gas-api.metaswap-dev.codefi.network';

export const GWEI = 'gwei';

export const MIN_GAS_PRICE_DEC = 0;
export const MIN_GAS_PRICE_HEX = MIN_GAS_PRICE_DEC.toString(16);
export const MIN_GAS_LIMIT_DEC = 21000;
export const MAX_GAS_LIMIT_DEC = 7920027;
export const MIN_GAS_LIMIT_HEX = MIN_GAS_LIMIT_DEC.toString(16);

export const GAS_LIMITS = {
  // maximum gasLimit of a simple send
  SIMPLE: addHexPrefix(MIN_GAS_LIMIT_HEX),
};

/**
 * Represents the user customizing their gas preference
 */
export const CUSTOM_GAS_ESTIMATE = 'custom';
