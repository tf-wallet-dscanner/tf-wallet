import { ObservableStore } from '@metamask/obs-store';
import { GAS_ESTIMATE_TYPES } from 'app/constants/gas';
import { SECOND } from 'app/constants/time';
import { isHexString } from 'ethereumjs-util';
import EthQuery from 'ethjs-query';

import determineGasFeeCalculations from './determineGasFeeCalculations';
import { getEIP1559GasAPIEndpoint, getLegacyGasAPIEndPoint } from './gas-util';

const defaultState = {
  gasFeeEstimates: {},
  estimatedGasFeeTimeBounds: {},
  gasEstimateType: GAS_ESTIMATE_TYPES.NONE,
};

export class GasFeeController {
  #intervalId;

  #intervalDelay;

  #legacyAPIEndpoint;

  #EIP1559APIEndpoint;

  #gasFeeStore;

  #getChainId;

  #getProvider;

  #ethQuery;

  constructor({ interval = SECOND * 10, getChainId, getProvider }) {
    this.#intervalDelay = interval;
    this.#getChainId = getChainId;
    this.#legacyAPIEndpoint = getLegacyGasAPIEndPoint(getChainId());
    this.#EIP1559APIEndpoint = getEIP1559GasAPIEndpoint(getChainId());
    this.#getProvider = getProvider;
    this.#ethQuery = new EthQuery(getProvider());

    this.#gasFeeStore = new ObservableStore({
      ...defaultState,
    });
  }

  async fetchGasFeeEstimates(options) {
    const estimateData = await this.#fetchGasFeeEstimateData(options);
    return estimateData;
  }

  /**
   * Gets and sets gasFeeEstimates in state.
   *
   * @param options - The gas fee estimate options.
   * @param options.shouldUpdateState - Determines whether the state should be updated with the
   * updated gas estimates.
   * @returns The gas fee estimates.
   */
  async #fetchGasFeeEstimateData(options = {}) {
    const { shouldUpdateState = true } = options;
    let isEIP1559Compatible;
    const isLegacyGasAPICompatible =
      this.getCurrentNetworkLegacyGasAPICompatibility();

    let chainId = this.#getChainId();
    if (typeof chainId === 'string' && isHexString(chainId)) {
      chainId = parseInt(chainId, 16);
    }

    try {
      isEIP1559Compatible = await this.getEIP1559Compatibility();
    } catch (e) {
      console.error(e);
      isEIP1559Compatible = false;
    }

    const gasFeeCalculations = await determineGasFeeCalculations({
      isEIP1559Compatible,
      isLegacyGasAPICompatible,
      fetchGasEstimatesUrl: this.#EIP1559APIEndpoint,
      fetchLegacyGasPriceEstimatesUrl: this.#legacyAPIEndpoint,
      ethQuery: this.#ethQuery,
    });

    if (shouldUpdateState) {
      this.#gasFeeStore.updateState({
        gasFeeEstimates: gasFeeCalculations.gasFeeEstimates,
        estimatedGasFeeTimeBounds: {
          ...gasFeeCalculations.estimatedGasFeeTimeBounds,
        },
        gasEstimateType: gasFeeCalculations.gasEstimateType,
      });
    }

    return gasFeeCalculations;
  }
}
