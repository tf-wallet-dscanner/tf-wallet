import { BackgroundMessages } from 'app/messages';
import Messenger from 'app/messenger';

export async function getLatestBlock() {
  const { block } = await Messenger.sendMessageToBackground(
    BackgroundMessages.GET_LATEST_BLOCK,
  );
  return block;
}

export async function getNetworkId() {
  const { networkId } = await Messenger.sendMessageToBackground(
    BackgroundMessages.GET_NETWORK_ID,
  );
  return networkId;
}
