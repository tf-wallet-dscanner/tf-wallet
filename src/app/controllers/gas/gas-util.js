import { GAS_API_BASE_URL, GAS_DEV_API_BASE_URL } from 'app/constants/gas';
import { gweiDecToWEIBN, weiHexToGweiDec } from 'app/lib/util';
import { BN, isHexString } from 'ethereumjs-util';

import { hexToBn } from '../transactions/tx-util';

const gasApiBaseUrl = process.env.SWAPS_USE_DEV_APIS
  ? GAS_DEV_API_BASE_URL
  : GAS_API_BASE_URL;

/**
 * EIP1559 이전 gas price api url
 * @param {HexString} chainId
 * @returns {string}
 */
export function getLegacyGasAPIEndPoint(chainId) {
  return `${gasApiBaseUrl}/networks/${chainId}/gasPrices`;
}

/**
 * EIP1559 gas price api url
 * @param {HexString} chainId
 * @returns {string}
 */
export function getEIP1559GasAPIEndpoint(chainId) {
  return `${gasApiBaseUrl}/networks/${chainId}/suggestedGasFees`;
}

/**
 * @param {string} clientId
 * @returns
 */
const makeClientIdHeader = (clientId) => ({ 'X-Client-Id': clientId });

/**
 * Convert a decimal GWEI value to a decimal string rounded to the nearest WEI.
 *
 * @param {string | number}n - The input GWEI amount, as a decimal string or a number.
 * @returns The decimal string GWEI amount.
 */
export function normalizeGWEIDecimalNumbers(n) {
  const numberAsWEIHex = gweiDecToWEIBN(n).toString(16);
  const numberAsGWEI = weiHexToGweiDec(numberAsWEIHex).toString(10);
  return numberAsGWEI;
}

/**
 * Parses a hex string and converts it into a number that can be operated on in a bignum-safe,
 * base-10 way.
 *
 * @param value - A base-16 number encoded as a string.
 * @returns The number as a BN object in base-16 mode.
 */
export function fromHex(value) {
  if (BN.isBN(value)) {
    return value;
  }
  return new BN(hexToBn(value).toString(10));
}

/**
 * Converts an integer to a hexadecimal representation.
 *
 * @param value - An integer, an integer encoded as a base-10 string, or a BN.
 * @returns The integer encoded as a hex string.
 */
export function toHex(value) {
  if (typeof value === 'string' && isHexString(value)) {
    return value;
  }
  const hexString = BN.isBN(value)
    ? value.toString(16)
    : new BN(value.toString(), 10).toString(16);
  return `0x${hexString}`;
}

/**
 * Execute fetch and verify that the response was successful.
 *
 * @param {string}request - Request information.
 * @param {RequestInit}options - Fetch options.
 * @returns The fetch response.
 */
export async function successfulFetch(request, options) {
  const response = await fetch(request, options);
  if (!response.ok) {
    throw new Error(
      `Fetch failed with status '${response.status}' for request '${request}'`,
    );
  }
  return response;
}

/**
 * Execute fetch and return object response.
 *
 * @param {string}request - The request information.
 * @param {RequestInit}options - The fetch options.
 * @returns The fetch response JSON data.
 */
export async function handleFetch(request, options) {
  const response = await successfulFetch(request, options);
  const object = await response.json();
  return object;
}

/**
 * A function that fetches gas estimates using an EIP-1559-specific API.
 * Fetch gas estimates from the given URL.
 * @param url - The gas estimate URL.
 * @param clientId - The client ID used to identify to the API who is asking for estimates.
 * @returns The gas estimates.
 */
export async function fetchGasEstimates(url, clientId) {
  const estimates = await handleFetch(
    url,
    clientId ? { headers: makeClientIdHeader(clientId) } : undefined,
  );
  return {
    low: {
      ...estimates.low,
      suggestedMaxPriorityFeePerGas: normalizeGWEIDecimalNumbers(
        estimates.low.suggestedMaxPriorityFeePerGas,
      ),
      suggestedMaxFeePerGas: normalizeGWEIDecimalNumbers(
        estimates.low.suggestedMaxFeePerGas,
      ),
    },
    medium: {
      ...estimates.medium,
      suggestedMaxPriorityFeePerGas: normalizeGWEIDecimalNumbers(
        estimates.medium.suggestedMaxPriorityFeePerGas,
      ),
      suggestedMaxFeePerGas: normalizeGWEIDecimalNumbers(
        estimates.medium.suggestedMaxFeePerGas,
      ),
    },
    high: {
      ...estimates.high,
      suggestedMaxPriorityFeePerGas: normalizeGWEIDecimalNumbers(
        estimates.high.suggestedMaxPriorityFeePerGas,
      ),
      suggestedMaxFeePerGas: normalizeGWEIDecimalNumbers(
        estimates.high.suggestedMaxFeePerGas,
      ),
    },
    estimatedBaseFee: normalizeGWEIDecimalNumbers(estimates.estimatedBaseFee),
    historicalBaseFeeRange: estimates.historicalBaseFeeRange,
    baseFeeTrend: estimates.baseFeeTrend,
    latestPriorityFeeRange: estimates.latestPriorityFeeRange,
    historicalPriorityFeeRange: estimates.historicalPriorityFeeRange,
    priorityFeeTrend: estimates.priorityFeeTrend,
    networkCongestion: estimates.networkCongestion,
  };
}

/**
 * A function that fetches gas estimates using an non-EIP-1559-specific API.
 * Hit the legacy MetaSwaps gasPrices estimate api and return the low, medium
 * high values from that API.
 * @param {string}url - The URL to fetch gas price estimates from.
 * @param {string}clientId - The client ID used to identify to the API who is asking for estimates.
 * @returns The gas price estimates.
 */
export async function fetchLegacyGasPriceEstimates(url, clientId) {
  const result = await handleFetch(url, {
    referrer: url,
    referrerPolicy: 'no-referrer-when-downgrade',
    method: 'GET',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      ...(clientId && makeClientIdHeader(clientId)),
    },
  });
  return {
    low: result.SafeGasPrice,
    medium: result.ProposeGasPrice,
    high: result.FastGasPrice,
  };
}

/**
 * non-EIP-1559-specific estimates.
 * Get a gas price estimate from the network using the `eth_gasPrice` method.
 * @param {ProviderController.query} ethQuery - The EthQuery instance to call the network with.
 * @returns A gas price estimate.
 */
export async function fetchEthGasPriceEstimate(ethQuery) {
  const gasPrice = await ethQuery('eth_gasPrice');
  const hexGasPrice = gasPrice.toString(16);
  return {
    gasPrice: weiHexToGweiDec(hexGasPrice).toString(),
  };
}

/**
 * A function that determine time estimate bounds.
 * Estimate the time it will take for a transaction to be confirmed.
 * @param {string}maxPriorityFeePerGas - The max priority fee per gas.
 * @param {string}maxFeePerGas - The max fee per gas.
 * @param {GasFeeEstimates}gasFeeEstimates - The gas fee estimates.
 * @returns The estimated lower and upper bounds for when this transaction will be confirmed.
 */
export function calculateTimeEstimate(
  maxPriorityFeePerGas,
  maxFeePerGas,
  gasFeeEstimates,
) {
  const { low, medium, high, estimatedBaseFee } = gasFeeEstimates;

  const maxPriorityFeePerGasInWEI = gweiDecToWEIBN(maxPriorityFeePerGas);
  const maxFeePerGasInWEI = gweiDecToWEIBN(maxFeePerGas);
  const estimatedBaseFeeInWEI = gweiDecToWEIBN(estimatedBaseFee);

  const effectiveMaxPriorityFee = BN.min(
    maxPriorityFeePerGasInWEI,
    maxFeePerGasInWEI.sub(estimatedBaseFeeInWEI),
  );

  const lowMaxPriorityFeeInWEI = gweiDecToWEIBN(
    low.suggestedMaxPriorityFeePerGas,
  );
  const mediumMaxPriorityFeeInWEI = gweiDecToWEIBN(
    medium.suggestedMaxPriorityFeePerGas,
  );
  const highMaxPriorityFeeInWEI = gweiDecToWEIBN(
    high.suggestedMaxPriorityFeePerGas,
  );

  let lowerTimeBound;
  let upperTimeBound;

  if (effectiveMaxPriorityFee.lt(lowMaxPriorityFeeInWEI)) {
    lowerTimeBound = null;
    upperTimeBound = 'unknown';
  } else if (
    effectiveMaxPriorityFee.gte(lowMaxPriorityFeeInWEI) &&
    effectiveMaxPriorityFee.lt(mediumMaxPriorityFeeInWEI)
  ) {
    lowerTimeBound = low.minWaitTimeEstimate;
    upperTimeBound = low.maxWaitTimeEstimate;
  } else if (
    effectiveMaxPriorityFee.gte(mediumMaxPriorityFeeInWEI) &&
    effectiveMaxPriorityFee.lt(highMaxPriorityFeeInWEI)
  ) {
    lowerTimeBound = medium.minWaitTimeEstimate;
    upperTimeBound = medium.maxWaitTimeEstimate;
  } else if (effectiveMaxPriorityFee.eq(highMaxPriorityFeeInWEI)) {
    lowerTimeBound = high.minWaitTimeEstimate;
    upperTimeBound = high.maxWaitTimeEstimate;
  } else {
    lowerTimeBound = 0;
    upperTimeBound = high.maxWaitTimeEstimate;
  }

  return {
    lowerTimeBound,
    upperTimeBound,
  };
}
