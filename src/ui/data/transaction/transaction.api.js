import { BackgroundMessages } from 'app/messages';
import Messenger from 'app/messenger';

/**
 * 코인/토큰 보내기
 * @param {object} txMeta
 * @param {string} txMeta.password - 사용자 패스워드
 * @param {string} txMeta.to - 받는 사람
 * @param {number} txMeta.decimalValue - 보내는 코인/토큰 양 (DEC)
 * @param {number} txMeta.gas - DEC
 * @param {number} txMeta.gasPrice - ETH(KLAY) DEC
 * @param {number} txMeta.maxFeePerGas - The maximum fee per gas that the transaction is willing to pay in total
 * @param {number} txMeta.maxPriorityFeePerGas - The maximum fee per gas to give miners to incentivize them to include the transaction (Priority fee)
 * @returns {string} txResult - 트랜잭션 해쉬값(txHash)
 */
export async function sendRawTransaction(txMeta) {
  const { txResult } = await Messenger.sendMessageToBackground(
    BackgroundMessages.SEND_RAW_TRANSACTION,
    txMeta,
  );
  return txResult;
}

/**
 * gas 추정치 계산값
 * @returns estimateData
 * @returns {string} estimateData.pollToken
 * @returns {object} estimateData.gasFeeEstimates - { low, medium, high }
 * @returns {object} estimateData.estimatedGasFeeTimeBounds - { lowerTimeBound, upperTimeBound }
 * @returns {GAS_ESTIMATE_TYPES} estimateData.gasEstimateType - 'fee-market' | 'legacy' | 'eth_gasPrice' | 'none'
 */
export async function getGasFeeEstimates() {
  const estimateData = await Messenger.sendMessageToBackground(
    BackgroundMessages.GET_GAS_FEE_ESTIMATES,
  );
  return estimateData;
}
