import { BackgroundMessages } from 'app/messages';
import Messenger from 'app/messenger';

export async function sendRawTransaction({ password, to, decimalValue }) {
  const { txResult } = await Messenger.sendMessageToBackground(
    BackgroundMessages.SEND_RAW_TRANSACTION,
    {
      password,
      to,
      decimalValue,
    },
  );
  return txResult;
}

export async function getGasFeeEstimatesAndStartPolling() {
  const { pollToken } = await Messenger.sendMessageToBackground(
    BackgroundMessages.SEND_RAW_TGET_GAS_FEE_ESTIMATE_START_POLLING,
  );
  return pollToken;
}
