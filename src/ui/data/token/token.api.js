import { BackgroundMessages } from 'app/messages';
import Messenger from 'app/messenger';

export async function getTokens() {
  const { tokens } = await Messenger.sendMessageToBackground(
    BackgroundMessages.GET_TOKENS,
  );
  return tokens;
}

export async function addToken({ tokenAddress, symbol, decimals }) {
  const { tokenResult } = await Messenger.sendMessageToBackground(
    BackgroundMessages.ADD_TOKEN,
    {
      tokenAddress,
      symbol,
      decimals,
    },
  );
  return tokenResult;
}

export async function switchAccounts() {
  const { address } = await Messenger.sendMessageToBackground(
    BackgroundMessages.SWITCH_ACCOUNTS,
  );
  return address;
}
