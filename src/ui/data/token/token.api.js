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

export async function transferERC20({ receiver, amount }) {
  const { txResult } = await Messenger.sendMessageToBackground(
    BackgroundMessages.TRANSFER_ERC20,
    { receiver, amount },
  );
  return txResult;
}
