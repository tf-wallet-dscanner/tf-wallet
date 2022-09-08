import { GAS_ESTIMATE_TYPES } from 'app/constants/gas';

import fetchGasEstimatesViaEthFeeHistory from './fetchGasEstimatesViaEthFeeHistory';
import {
  calculateTimeEstimate,
  fetchEthGasPriceEstimate,
  fetchGasEstimates,
  fetchLegacyGasPriceEstimates,
} from './gas-util';

/**
 * Obtains a set of max base and priority fee estimates along with time estimates so that we
 * can present them to users when they are sending transactions or making swaps.
 *
 * @param args - The arguments.
 * @param args.isEIP1559Compatible - Governs whether or not we can use an EIP-1559-only method to
 * produce estimates.
 * @param args.isLegacyGasAPICompatible - Governs whether or not we can use a non-EIP-1559 method to
 * produce estimates (for instance, testnets do not support estimates altogether).
 * @param args.fetchGasEstimatesUrl - The URL for the API we can use to obtain EIP-1559-specific
 * estimates.
 * @param args.fetchLegacyGasPriceEstimatesUrl - The URL for the API we can use to obtain
 * non-EIP-1559-specific estimates.
 * @param args.chainId - specific network provider chainId
 * @param args.ethQuery - An EthQuery instance we can use to talk to Ethereum directly.
 * @returns The gas fee calculations.
 */
export default async function determineGasFeeCalculations({
  isEIP1559Compatible,
  isLegacyGasAPICompatible,
  fetchGasEstimatesUrl,
  fetchLegacyGasPriceEstimatesUrl,
  ethQuery,
}) {
  try {
    if (isEIP1559Compatible) {
      let estimates;
      try {
        estimates = await fetchGasEstimates(fetchGasEstimatesUrl);
      } catch (e) {
        estimates = await fetchGasEstimatesViaEthFeeHistory(ethQuery);
      }
      const { suggestedMaxPriorityFeePerGas, suggestedMaxFeePerGas } =
        estimates.medium;
      const estimatedGasFeeTimeBounds = calculateTimeEstimate(
        suggestedMaxPriorityFeePerGas,
        suggestedMaxFeePerGas,
        estimates,
      );
      return {
        gasFeeEstimates: estimates,
        estimatedGasFeeTimeBounds,
        gasEstimateType: GAS_ESTIMATE_TYPES.FEE_MARKET,
      };
    } else if (isLegacyGasAPICompatible) {
      // The URL for the API we can use to obtain non-EIP-1559-specific estimates.
      const estimates = await fetchLegacyGasPriceEstimates(
        fetchLegacyGasPriceEstimatesUrl,
      );
      return {
        gasFeeEstimates: estimates,
        estimatedGasFeeTimeBounds: {},
        gasEstimateType: GAS_ESTIMATE_TYPES.LEGACY,
      };
    }
    throw new Error('Main gas fee/price estimation failed. Use fallback');
  } catch {
    try {
      const estimates = await fetchEthGasPriceEstimate(ethQuery);
      return {
        gasFeeEstimates: estimates,
        estimatedGasFeeTimeBounds: {},
        gasEstimateType: GAS_ESTIMATE_TYPES.ETH_GASPRICE,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Gas fee/price estimation failed. Message: ${error.message}`,
        );
      }
      throw error;
    }
  }
}
