const { isHexString } = require('ethereumjs-util');

// gas station: https://gas-api.metaswap.codefi.network/networks/1/suggestedGasFees
export class GasFeeController {
  /**
   * `@ethereumjs/tx` uses `@ethereumjs/common` as a configuration tool for
   * specifying which chain, network, hardfork and EIPs to support for
   * a transaction. By referencing this configuration, and analyzing the fields
   * specified in txParams, `@ethereumjs/tx` is able to determine which EIP-2718
   * transaction type to use.
   *
   * @param fromAddress
   * @returns {Common} common configuration object
   */
  async getCommonConfiguration(fromAddress) {
    //   const { type, nickname: name } = this.getProviderConfig();
    //   const supportsEIP1559 = await this.getEIP1559Compatibility(fromAddress);
    //   // This logic below will have to be updated each time a hardfork happens
    //   // that carries with it a new Transaction type. It is inconsequential for
    //   // hardforks that do not include new types.
    //   const hardfork = supportsEIP1559 ? HARDFORKS.LONDON : HARDFORKS.BERLIN;
    //   // type will be one of our default network names or 'rpc'. the default
    //   // network names are sufficient configuration, simply pass the name as the
    //   // chain argument in the constructor.
    //   if (type !== NETWORK_TYPE_RPC) {
    //     return new Common({
    //       chain: type,
    //       hardfork,
    //     });
    //   }
    //   // For 'rpc' we need to use the same basic configuration as mainnet,
    //   // since we only support EVM compatible chains, and then override the
    //   // name, chainId and networkId properties. This is done using the
    //   // `forCustomChain` static method on the Common class.
    //   const chainId = parseInt(this._getCurrentChainId(), 16);
    //   const networkId = this.networkStore.getState();
    //   const customChainParams = {
    //     name,
    //     chainId,
    //     // It is improbable for a transaction to be signed while the network
    //     // is loading for two reasons.
    //     // 1. Pending, unconfirmed transactions are wiped on network change
    //     // 2. The UI is unusable (loading indicator) when network is loading.
    //     // setting the networkId to 0 is for type safety and to explicity lead
    //     // the transaction to failing if a user is able to get to this branch
    //     // on a custom network that requires valid network id. I have not ran
    //     // into this limitation on any network I have attempted, even when
    //     // hardcoding networkId to 'loading'.
    //     networkId: networkId === 'loading' ? 0 : parseInt(networkId, 10),
    //   };
    //   return Common.forCustomChain(MAINNET, customChainParams, hardfork);
  }

  /**
   * Adds the tx gas defaults: gas && gasPrice
   *
   * @param {Object} txMeta - the txMeta object
   * @param getCodeResponse
   * @returns {Promise<object>} resolves with txMeta
   */
  async addTxGasDefaults(txMeta, getCodeResponse) {
    // const eip1559Compatibility =
    //   txMeta.txParams.type !== TRANSACTION_ENVELOPE_TYPES.LEGACY &&
    //   (await this.getEIP1559Compatibility());
    // const {
    //   gasPrice: defaultGasPrice,
    //   maxFeePerGas: defaultMaxFeePerGas,
    //   maxPriorityFeePerGas: defaultMaxPriorityFeePerGas,
    // } = await this._getDefaultGasFees(txMeta, eip1559Compatibility);
    // const {
    //   gasLimit: defaultGasLimit,
    //   simulationFails,
    // } = await this._getDefaultGasLimit(txMeta, getCodeResponse);
    // // eslint-disable-next-line no-param-reassign
    // txMeta = this.txStateManager.getTransaction(txMeta.id);
    // if (simulationFails) {
    //   txMeta.simulationFails = simulationFails;
    // }
    // if (eip1559Compatibility) {
    //   const { eip1559V2Enabled } = this.preferencesStore.getState();
    //   const advancedGasFeeDefaultValues = this.getAdvancedGasFee();
    //   if (
    //     eip1559V2Enabled &&
    //     Boolean(advancedGasFeeDefaultValues) &&
    //     !SWAP_TRANSACTION_TYPES.includes(txMeta.type)
    //   ) {
    //     txMeta.userFeeLevel = CUSTOM_GAS_ESTIMATE;
    //     txMeta.txParams.maxFeePerGas = decGWEIToHexWEI(
    //       advancedGasFeeDefaultValues.maxBaseFee,
    //     );
    //     txMeta.txParams.maxPriorityFeePerGas = decGWEIToHexWEI(
    //       advancedGasFeeDefaultValues.priorityFee,
    //     );
    //   } else if (
    //     txMeta.txParams.gasPrice &&
    //     !txMeta.txParams.maxFeePerGas &&
    //     !txMeta.txParams.maxPriorityFeePerGas
    //   ) {
    //     // If the dapp has suggested a gas price, but no maxFeePerGas or maxPriorityFeePerGas
    //     //  then we set maxFeePerGas and maxPriorityFeePerGas to the suggested gasPrice.
    //     txMeta.txParams.maxFeePerGas = txMeta.txParams.gasPrice;
    //     txMeta.txParams.maxPriorityFeePerGas = txMeta.txParams.gasPrice;
    //     if (eip1559V2Enabled && txMeta.origin !== ORIGIN_METAMASK) {
    //       txMeta.userFeeLevel = PRIORITY_LEVELS.DAPP_SUGGESTED;
    //     } else {
    //       txMeta.userFeeLevel = CUSTOM_GAS_ESTIMATE;
    //     }
    //   } else {
    //     if (
    //       (defaultMaxFeePerGas &&
    //         defaultMaxPriorityFeePerGas &&
    //         !txMeta.txParams.maxFeePerGas &&
    //         !txMeta.txParams.maxPriorityFeePerGas) ||
    //       txMeta.origin === ORIGIN_METAMASK
    //     ) {
    //       txMeta.userFeeLevel = GAS_RECOMMENDATIONS.MEDIUM;
    //     } else if (eip1559V2Enabled) {
    //       txMeta.userFeeLevel = PRIORITY_LEVELS.DAPP_SUGGESTED;
    //     } else {
    //       txMeta.userFeeLevel = CUSTOM_GAS_ESTIMATE;
    //     }
    //     if (defaultMaxFeePerGas && !txMeta.txParams.maxFeePerGas) {
    //       // If the dapp has not set the gasPrice or the maxFeePerGas, then we set maxFeePerGas
    //       // with the one returned by the gasFeeController, if that is available.
    //       txMeta.txParams.maxFeePerGas = defaultMaxFeePerGas;
    //     }
    //     if (
    //       defaultMaxPriorityFeePerGas &&
    //       !txMeta.txParams.maxPriorityFeePerGas
    //     ) {
    //       // If the dapp has not set the gasPrice or the maxPriorityFeePerGas, then we set maxPriorityFeePerGas
    //       // with the one returned by the gasFeeController, if that is available.
    //       txMeta.txParams.maxPriorityFeePerGas = defaultMaxPriorityFeePerGas;
    //     }
    //     if (defaultGasPrice && !txMeta.txParams.maxFeePerGas) {
    //       // If the dapp has not set the gasPrice or the maxFeePerGas, and no maxFeePerGas is available
    //       // from the gasFeeController, then we set maxFeePerGas to the defaultGasPrice, assuming it is
    //       // available.
    //       txMeta.txParams.maxFeePerGas = defaultGasPrice;
    //     }
    //     if (
    //       txMeta.txParams.maxFeePerGas &&
    //       !txMeta.txParams.maxPriorityFeePerGas
    //     ) {
    //       // If the dapp has not set the gasPrice or the maxPriorityFeePerGas, and no maxPriorityFeePerGas is
    //       // available from the gasFeeController, then we set maxPriorityFeePerGas to
    //       // txMeta.txParams.maxFeePerGas, which will either be the gasPrice from the controller, the maxFeePerGas
    //       // set by the dapp, or the maxFeePerGas from the controller.
    //       txMeta.txParams.maxPriorityFeePerGas = txMeta.txParams.maxFeePerGas;
    //     }
    //   }
    //   // We remove the gasPrice param entirely when on an eip1559 compatible network
    //   delete txMeta.txParams.gasPrice;
    // } else {
    //   // We ensure that maxFeePerGas and maxPriorityFeePerGas are not in the transaction params
    //   // when not on a EIP1559 compatible network
    //   delete txMeta.txParams.maxPriorityFeePerGas;
    //   delete txMeta.txParams.maxFeePerGas;
    // }
    // // If we have gotten to this point, and none of gasPrice, maxPriorityFeePerGas or maxFeePerGas are
    // // set on txParams, it means that either we are on a non-EIP1559 network and the dapp didn't suggest
    // // a gas price, or we are on an EIP1559 network, and none of gasPrice, maxPriorityFeePerGas or maxFeePerGas
    // // were available from either the dapp or the network.
    // if (
    //   defaultGasPrice &&
    //   !txMeta.txParams.gasPrice &&
    //   !txMeta.txParams.maxPriorityFeePerGas &&
    //   !txMeta.txParams.maxFeePerGas
    // ) {
    //   txMeta.txParams.gasPrice = defaultGasPrice;
    // }
    // if (defaultGasLimit && !txMeta.txParams.gas) {
    //   txMeta.txParams.gas = defaultGasLimit;
    //   txMeta.originalGasEstimate = defaultGasLimit;
    // }
    // txMeta.defaultGasEstimates = {
    //   estimateType: txMeta.userFeeLevel,
    //   gas: txMeta.txParams.gas,
    //   gasPrice: txMeta.txParams.gasPrice,
    //   maxFeePerGas: txMeta.txParams.maxFeePerGas,
    //   maxPriorityFeePerGas: txMeta.txParams.maxPriorityFeePerGas,
    // };
    // return txMeta;
  }

  /**
   * Gets default gas fees, or returns `undefined` if gas fees are already set
   *
   * @param {Object} txMeta - The txMeta object
   * @param eip1559Compatibility
   * @returns {Promise<string|undefined>} The default gas price
   */
  async _getDefaultGasFees(txMeta, eip1559Compatibility) {
    // if (
    //   (!eip1559Compatibility && txMeta.txParams.gasPrice) ||
    //   (eip1559Compatibility &&
    //     txMeta.txParams.maxFeePerGas &&
    //     txMeta.txParams.maxPriorityFeePerGas)
    // ) {
    //   return {};
    // }
    // try {
    //   const { gasFeeEstimates, gasEstimateType } =
    //     await this._getEIP1559GasFeeEstimates();
    //   if (
    //     eip1559Compatibility &&
    //     gasEstimateType === GAS_ESTIMATE_TYPES.FEE_MARKET
    //   ) {
    //     const {
    //       medium: { suggestedMaxPriorityFeePerGas, suggestedMaxFeePerGas } = {},
    //     } = gasFeeEstimates;
    //     if (suggestedMaxPriorityFeePerGas && suggestedMaxFeePerGas) {
    //       return {
    //         maxFeePerGas: decGWEIToHexWEI(suggestedMaxFeePerGas),
    //         maxPriorityFeePerGas: decGWEIToHexWEI(
    //           suggestedMaxPriorityFeePerGas,
    //         ),
    //       };
    //     }
    //   } else if (gasEstimateType === GAS_ESTIMATE_TYPES.LEGACY) {
    //     // The LEGACY type includes low, medium and high estimates of
    //     // gas price values.
    //     return {
    //       gasPrice: decGWEIToHexWEI(gasFeeEstimates.medium),
    //     };
    //   } else if (gasEstimateType === GAS_ESTIMATE_TYPES.ETH_GASPRICE) {
    //     // The ETH_GASPRICE type just includes a single gas price property,
    //     // which we can assume was retrieved from eth_gasPrice
    //     return {
    //       gasPrice: decGWEIToHexWEI(gasFeeEstimates.gasPrice),
    //     };
    //   }
    // } catch (e) {
    //   console.error(e);
    // }
    // const gasPrice = await this.query.gasPrice();
    // return { gasPrice: gasPrice && addHexPrefix(gasPrice.toString(16)) };
  }

  /**
   * Given a TransactionMeta object, generate new gas params such that if the
   * transaction was an EIP1559 transaction, it only has EIP1559 gas fields,
   * otherwise it only has gasPrice. Will use whatever custom values are
   * specified in customGasSettings, or falls back to incrementing by a percent
   * which is defined by specifying a numerator. 11 is a 10% bump, 12 would be
   * a 20% bump, and so on.
   *
   * @param {TransactionMeta} originalTxMeta - Original transaction to use as
   *  base
   * @param {CustomGasSettings} [customGasSettings] - overrides for the gas
   *  fields to use instead of the multiplier
   * @param {number} [incrementNumerator] - Numerator from which to generate a
   *  percentage bump of gas price. E.g 11 would be a 10% bump over base.
   * @returns {{ newGasParams: CustomGasSettings, previousGasParams: CustomGasSettings }}
   */
  generateNewGasParams(
    originalTxMeta,
    customGasSettings = {},
    incrementNumerator = 11,
  ) {
    // const { txParams } = originalTxMeta;
    // const previousGasParams = {};
    // const newGasParams = {};
    // if (customGasSettings.gasLimit) {
    //   newGasParams.gas = customGasSettings?.gas ?? GAS_LIMITS.SIMPLE;
    // }
    // if (customGasSettings.estimateSuggested) {
    //   newGasParams.estimateSuggested = customGasSettings.estimateSuggested;
    // }
    // if (customGasSettings.estimateUsed) {
    //   newGasParams.estimateUsed = customGasSettings.estimateUsed;
    // }
    // if (isEIP1559Transaction(originalTxMeta)) {
    //   previousGasParams.maxFeePerGas = txParams.maxFeePerGas;
    //   previousGasParams.maxPriorityFeePerGas = txParams.maxPriorityFeePerGas;
    //   newGasParams.maxFeePerGas =
    //     customGasSettings?.maxFeePerGas ||
    //     bnToHex(
    //       BnMultiplyByFraction(
    //         hexToBn(txParams.maxFeePerGas),
    //         incrementNumerator,
    //         10,
    //       ),
    //     );
    //   newGasParams.maxPriorityFeePerGas =
    //     customGasSettings?.maxPriorityFeePerGas ||
    //     bnToHex(
    //       BnMultiplyByFraction(
    //         hexToBn(txParams.maxPriorityFeePerGas),
    //         incrementNumerator,
    //         10,
    //       ),
    //     );
    // } else {
    //   previousGasParams.gasPrice = txParams.gasPrice;
    //   newGasParams.gasPrice =
    //     customGasSettings?.gasPrice ||
    //     bnToHex(
    //       BnMultiplyByFraction(
    //         hexToBn(txParams.gasPrice),
    //         incrementNumerator,
    //         10,
    //       ),
    //     );
    // }
    // return { previousGasParams, newGasParams };
  }

  /**
   * Determines if the maxFeePerGas and maxPriorityFeePerGas fields are supplied
   * and valid inputs. This will return false for non hex string inputs.
   *
   * @param {import("../constants/transaction").TransactionMeta} transaction -
   *  the transaction to check
   * @returns {boolean} true if transaction uses valid EIP1559 fields
   */
  isEIP1559Transaction(transaction) {
    return (
      isHexString(transaction?.txParams?.maxFeePerGas) &&
      isHexString(transaction?.txParams?.maxPriorityFeePerGas)
    );
  }

  /**
   * Determine if the maxFeePerGas and maxPriorityFeePerGas fields are not
   * supplied and that the gasPrice field is valid if it is provided. This will
   * return false if gasPrice is a non hex string.
   *
   * @param {import("../constants/transaction").TransactionMeta} transaction -
   *  the transaction to check
   * @returns {boolean} true if transaction uses valid Legacy fields OR lacks
   *  EIP1559 fields
   */
  isLegacyTransaction(transaction) {
    return (
      typeof transaction.txParams.maxFeePerGas === 'undefined' &&
      typeof transaction.txParams.maxPriorityFeePerGas === 'undefined' &&
      (typeof transaction.txParams.gasPrice === 'undefined' ||
        isHexString(transaction.txParams.gasPrice))
    );
  }
}

// estimateGas(estimateGasParams) {
//   return new Promise((resolve, reject) => {
//     return this.txController.txGasUtil.query.estimateGas(
//       estimateGasParams,
//       (err, res) => {
//         if (err) {
//           return reject(err);
//         }

//         return resolve(res.toString(16));
//       },
//     );
//   });
// }

// /**
//  * Estimates the tx's gas usage
//  *
//  * @param {Object} txMeta - the txMeta object
//  * @returns {string} the estimated gas limit as a hex string
//  */
// async estimateTxGas(txMeta) {
// const txParams = cloneDeep(txMeta.txParams);

// // `eth_estimateGas` can fail if the user has insufficient balance for the
// // value being sent, or for the gas cost. We don't want to check their
// // balance here, we just want the gas estimate. The gas price is removed
// // to skip those balance checks. We check balance elsewhere. We also delete
// // maxFeePerGas and maxPriorityFeePerGas to support EIP-1559 txs.
// delete txParams.gasPrice;
// delete txParams.maxFeePerGas;
// delete txParams.maxPriorityFeePerGas;

// // estimate tx gas requirements
// return await this.query.estimateGas(txParams);
// }

// GasFeeController
// getGasFeeEstimatesAndStartPolling: gasFeeController.getGasFeeEstimatesAndStartPolling.bind(
//   gasFeeController,
// ),

// disconnectGasFeeEstimatePoller: gasFeeController.disconnectPoller.bind(
//   gasFeeController,
// ),

// getGasFeeTimeEstimate: gasFeeController.getTimeEstimate.bind(
//   gasFeeController,
// ),

// addPollingTokenToAppState: appStateController.addPollingToken.bind(
//   appStateController,
// ),

// removePollingTokenFromAppState: appStateController.removePollingToken.bind(
//   appStateController,
// ),
