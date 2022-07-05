import { createWalletMiddleware } from 'eth-json-rpc-middleware';
import { createScaffoldMiddleware, mergeMiddleware } from 'json-rpc-engine';

import {
  createPendingNonceMiddleware,
  createPendingTxMiddleware,
} from './middleware/pending';

export default function createMetamaskMiddleware({
  version,
  getAccounts,
  processTransaction,
  processEthSignMessage,
  processTypedMessage,
  processTypedMessageV3,
  processTypedMessageV4,
  processPersonalMessage,
  processDecryptMessage,
  processEncryptionPublicKey,
  getPendingNonce,
  getPendingTransactionByHash,
}: any) {
  const metamaskMiddleware = mergeMiddleware([
    createScaffoldMiddleware({
      eth_syncing: false,
      web3_clientVersion: `MetaMask/v${version}`,
    }),
    createWalletMiddleware({
      getAccounts,
      processDecryptMessage,
      processEncryptionPublicKey,
      processEthSignMessage,
      processPersonalMessage,
      processTransaction,
      processTypedMessage,
      processTypedMessageV3,
      processTypedMessageV4,
    }) as any,
    createPendingNonceMiddleware({ getPendingNonce }),
    createPendingTxMiddleware({ getPendingTransactionByHash }),
  ]);
  return metamaskMiddleware;
}
