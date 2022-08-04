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

/**
 *
 * @param {string} rpcUrl
 * @param {string} chainId
 * @returns void
 */
export async function setRpcTarget(rpcUrl, chainId) {
  const response = await Messenger.sendMessageToBackground(
    BackgroundMessages.SET_RPC_TARGET,
    {
      rpcUrl,
      chainId,
    },
  );
  return response;
}

/**
 *
 * @param {string} chainId
 * @returns void
 */
export async function setProviderType(chainId) {
  const response = await Messenger.sendMessageToBackground(
    BackgroundMessages.SET_PROVIDER_TYPE,
    {
      chainId,
    },
  );
  return response;
}
