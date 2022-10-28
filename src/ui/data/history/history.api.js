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
export async function getErc20TransferHistory(contractAddress) {
  const erc20transfers = await Messenger.sendMessageToBackground(
    BackgroundMessages.GET_ERC20_TRANSFER_HISTORY,
    { contractAddress },
  );
  return erc20transfers;
}

// erc721 transfer 내역 조회
export async function getErc721TransferHistory(contractAddress) {
  const erc721transfers = await Messenger.sendMessageToBackground(
    BackgroundMessages.GET_ERC721_TRANSFER_HISTORY,
    { contractAddress },
  );
  return erc721transfers;
}

// klaytn 트랜잭션 내역 조회
export async function getKlaytnTxHistory() {
  const klaytnTransactions = await Messenger.sendMessageToBackground(
    BackgroundMessages.GET_KLAYTN_TX_HISTORY,
  );
  return klaytnTransactions;
}
