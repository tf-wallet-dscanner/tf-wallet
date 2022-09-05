import { BackgroundMessages } from 'app/messages';
import Messenger from 'app/messenger';

export async function getTokens() {
  const { block } = await Messenger.sendMessageToBackground(
    BackgroundMessages.GET_TOKENS,
  );
  return block;
}

export async function addToken() {
  const { networkId } = await Messenger.sendMessageToBackground(
    BackgroundMessages.ADD_TOKEN,
  );
  return networkId;
}
