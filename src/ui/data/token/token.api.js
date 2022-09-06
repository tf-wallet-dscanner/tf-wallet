import { BackgroundMessages } from 'app/messages';
import Messenger from 'app/messenger';

export async function getTokens() {
  const { tokens } = await Messenger.sendMessageToBackground(
    BackgroundMessages.GET_TOKENS,
  );
  return tokens;
}

export async function addToken({ tokenAddress, symbol, decimals }) {
  const { token } = await Messenger.sendMessageToBackground(
    BackgroundMessages.ADD_TOKEN,
    {
      tokenAddress,
      symbol,
      decimals,
    },
  );
  return token;
}
