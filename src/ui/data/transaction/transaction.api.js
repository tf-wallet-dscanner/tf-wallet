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
