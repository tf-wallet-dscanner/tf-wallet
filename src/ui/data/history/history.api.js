import { BackgroundMessages } from 'app/messages';
import Messenger from 'app/messenger';

// eth 트랜잭션 내역 조회
export async function getEthTxHistory() {
  const ethTransactions = await Messenger.sendMessageToBackground(
    BackgroundMessages.GET_ETH_TX_HISTORY,
  );
  return ethTransactions;
}

// erc20 transfer 내역 조회
export async function getErc20TransferHistory() {
  const erc20transfers = await Messenger.sendMessageToBackground(
    BackgroundMessages.GET_ERC20_TRANSFER_HISTORY,
  );
  return erc20transfers;
}

// erc721 transfer 내역 조회
export async function getErc721TransferHistory() {
  const erc721transfers = await Messenger.sendMessageToBackground(
    BackgroundMessages.GET_ERC721_TRANSFER_HISTORY,
  );
  return erc721transfers;
}
