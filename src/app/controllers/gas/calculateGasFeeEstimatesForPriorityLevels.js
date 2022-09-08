import { GWEI } from 'app/constants/gas';
import { BN } from 'ethereumjs-util';
import { fromWei } from 'ethjs-unit';

import medianOf from './medianOf';

const PRIORITY_LEVELS = ['low', 'medium', 'high'];
const SETTINGS_BY_PRIORITY_LEVEL = {
  low: {
    percentile: 10,
    baseFeePercentageMultiplier: new BN(110),
    priorityFeePercentageMultiplier: new BN(94),
    minSuggestedMaxPriorityFeePerGas: new BN(1_000_000_000),
    estimatedWaitTimes: {
      minWaitTimeEstimate: 15_000,
      maxWaitTimeEstimate: 30_000,
    },
  },
  medium: {
    percentile: 20,
    baseFeePercentageMultiplier: new BN(120),
    priorityFeePercentageMultiplier: new BN(97),
    minSuggestedMaxPriorityFeePerGas: new BN(1_500_000_000),
    estimatedWaitTimes: {
      minWaitTimeEstimate: 15_000,
      maxWaitTimeEstimate: 45_000,
    },
  },
  high: {
    percentile: 30,
    baseFeePercentageMultiplier: new BN(125),
    priorityFeePercentageMultiplier: new BN(98),
    minSuggestedMaxPriorityFeePerGas: new BN(2_000_000_000),
    estimatedWaitTimes: {
      minWaitTimeEstimate: 15_000,
      maxWaitTimeEstimate: 60_000,
    },
  },
};

/**
 * Calculates a set of estimates assigned to a particular priority level based on the data returned
 * by `eth_feeHistory`.
 *
 * @param priorityLevel - The level of fees that dictates how soon a transaction may go through
 * ("low", "medium", or "high").
 * @param blocks - A set of blocks as obtained from {@link fetchBlockFeeHistory}.
 * @returns The estimates.
 */
function calculateEstimatesForPriorityLevel(priorityLevel, blocks) {
  const settings = SETTINGS_BY_PRIORITY_LEVEL[priorityLevel];

  const latestBaseFeePerGas = blocks[blocks.length - 1].baseFeePerGas;

  const adjustedBaseFee = latestBaseFeePerGas
    .mul(settings.baseFeePercentageMultiplier)
    .divn(100);
  const priorityFees = blocks
    .map((block) => {
      return 'priorityFeesByPercentile' in block
        ? block.priorityFeesByPercentile[settings.percentile]
        : null;
    })
    .filter(BN.isBN);
  const medianPriorityFee = medianOf(priorityFees);
  const adjustedPriorityFee = medianPriorityFee
    .mul(settings.priorityFeePercentageMultiplier)
    .divn(100);

  const suggestedMaxPriorityFeePerGas = BN.max(
    adjustedPriorityFee,
    settings.minSuggestedMaxPriorityFeePerGas,
  );
  const suggestedMaxFeePerGas = adjustedBaseFee.add(
    suggestedMaxPriorityFeePerGas,
  );

  return {
    ...settings.estimatedWaitTimes,
    suggestedMaxPriorityFeePerGas: fromWei(suggestedMaxPriorityFeePerGas, GWEI),
    suggestedMaxFeePerGas: fromWei(suggestedMaxFeePerGas, GWEI),
  };
}

/**
 * Calculates a set of estimates suitable for different priority levels based on the data returned
 * by `eth_feeHistory`.
 *
 * @param blocks - A set of blocks populated with data for priority fee percentiles 10, 20, and 30,
 * obtained via {@link BlockFeeHistoryDatasetFetcher}.
 * @returns The estimates.
 */
export default function calculateGasFeeEstimatesForPriorityLevels(blocks) {
  return PRIORITY_LEVELS.reduce((obj, priorityLevel) => {
    const gasEstimatesForPriorityLevel = calculateEstimatesForPriorityLevel(
      priorityLevel,
      blocks,
    );
    return { ...obj, [priorityLevel]: gasEstimatesForPriorityLevel };
  }, {});
}
