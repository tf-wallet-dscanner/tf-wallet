import { ObservableStore } from '@metamask/obs-store';
import { GAS_ESTIMATE_TYPES } from 'app/constants/gas';
import { SECOND } from 'app/constants/time';
import { safelyExecute } from 'app/lib/util';
import { isHexString } from 'ethereumjs-util';
import { v1 as random } from 'uuid';

import determineGasFeeCalculations from './determineGasFeeCalculations';
import {
  calculateTimeEstimate,
  getEIP1559GasAPIEndpoint,
  getLegacyGasAPIEndPoint,
} from './gas-util';

const defaultState = {
  gasFeeEstimates: {},
  estimatedGasFeeTimeBounds: {},
  gasEstimateType: GAS_ESTIMATE_TYPES.NONE,
};

export class GasFeeController {
  #intervalId;

  #intervalDelay;

  #pollTokens;

  #gasFeeStore;

  #getChainId;

  #currentChainId;

  #ethQuery;

  #getCurrentNetworkEIP1559Compatibility;

  #getCurrentNetworkLegacyGasAPICompatibility;

  #getCurrentAccountEIP1559Compatibility;

  constructor({
    interval = SECOND * 10,
    ethQuery,
    getChainId,
    getCurrentNetworkEIP1559Compatibility,
    getCurrentNetworkLegacyGasAPICompatibility,
    getCurrentAccountEIP1559Compatibility,
    onNetworkStateChange,
  }) {
    this.#intervalDelay = interval;
    this.#pollTokens = new Set();
    this.#getChainId = getChainId;
    this.#getChainId().then((chainId) => {
      this.#currentChainId = chainId;
    });
    this.#ethQuery = ethQuery;
    this.#getCurrentNetworkEIP1559Compatibility =
      getCurrentNetworkEIP1559Compatibility;
    this.#getCurrentNetworkLegacyGasAPICompatibility =
      getCurrentNetworkLegacyGasAPICompatibility;
    this.#getCurrentAccountEIP1559Compatibility =
      getCurrentAccountEIP1559Compatibility;

    this.#gasFeeStore = new ObservableStore({
      ...defaultState,
    });

    onNetworkStateChange(async () => {
      const newChainId = await this.#getChainId();
      if (this.#currentChainId !== newChainId) {
        this.#currentChainId = newChainId;
        await this.resetPolling();
      }
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
      this.#getCurrentNetworkLegacyGasAPICompatibility();

    let chainId = await this.#getChainId();

    if (typeof chainId === 'string' && isHexString(chainId)) {
      chainId = parseInt(chainId, 16);
    }
    const fetchGasEstimatesUrl = getEIP1559GasAPIEndpoint(chainId);
    const fetchLegacyGasPriceEstimatesUrl = getLegacyGasAPIEndPoint(chainId);

    try {
      isEIP1559Compatible = await this.#getEIP1559Compatibility();
    } catch (e) {
      console.error(e);
      isEIP1559Compatible = false;
    }

    const gasFeeCalculations = await determineGasFeeCalculations({
      isEIP1559Compatible,
      isLegacyGasAPICompatible,
      fetchGasEstimatesUrl,
      fetchLegacyGasPriceEstimatesUrl,
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

  async #getEIP1559Compatibility() {
    const currentNetworkIsEIP1559Compatible =
      await this.#getCurrentNetworkEIP1559Compatibility();
    const currentAccountIsEIP1559Compatible =
      this.#getCurrentAccountEIP1559Compatibility?.() ?? true;

    return (
      currentNetworkIsEIP1559Compatible && currentAccountIsEIP1559Compatible
    );
  }

  async resetPolling() {
    if (this.#pollTokens.size !== 0) {
      const tokens = Array.from(this.#pollTokens);
      this.stopPolling();
      await this.getGasFeeEstimatesAndStartPolling(tokens[0]);
      tokens.slice(1).forEach((token) => {
        this.#pollTokens.add(token);
      });
    }
  }

  async getGasFeeEstimatesAndStartPolling(pollToken) {
    const _pollToken = pollToken || random();

    this.#pollTokens.add(_pollToken);

    if (this.#pollTokens.size === 1) {
      await this.#fetchGasFeeEstimateData();
      this.#poll();
    }

    return _pollToken;
  }

  #poll() {
    if (this.#intervalId) {
      clearInterval(this.#intervalId);
    }

    this.#intervalId = setInterval(async () => {
      await safelyExecute(() => this.#fetchGasFeeEstimateData());
    }, this.#intervalDelay);
  }

  /**
   * Remove the poll token, and stop polling if the set of poll tokens is empty.
   *
   * @param {string} pollToken - The poll token to disconnect.
   */
  disconnectPoller(pollToken) {
    this.#pollTokens.delete(pollToken);
    if (this.#pollTokens.size === 0) {
      this.stopPolling();
    }
  }

  stopPolling() {
    if (this.#intervalId) {
      clearInterval(this.#intervalId);
    }
    this.#pollTokens.clear();
    this.#resetState();
  }

  #resetState() {
    this.#gasFeeStore.putState({ ...defaultState });
  }

  // 트랜잭션이 수행되는데 걸리는 시간을 추정하는 함수
  getTimeEstimate(maxPriorityFeePerGas, maxFeePerGas) {
    const { gasFeeEstimates, gasEstimateType } = this.#gasFeeStore.getState();
    if (!gasFeeEstimates || gasEstimateType !== GAS_ESTIMATE_TYPES.FEE_MARKET) {
      return {};
    }
    return calculateTimeEstimate(
      maxPriorityFeePerGas,
      maxFeePerGas,
      gasFeeEstimates,
    );
  }
}
