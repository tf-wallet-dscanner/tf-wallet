import { createAsyncMiddleware } from 'json-rpc-engine';

import { formatTxMetaForRpcResult } from '../util';

export function createPendingNonceMiddleware({ getPendingNonce }: any) {
  return createAsyncMiddleware(async (req: any, res: any, next: any) => {
    const { method, params } = req;
    if (method !== 'eth_getTransactionCount') {
      next();
      return;
    }
    const [param, blockRef] = params;
    if (blockRef !== 'pending') {
      next();
      return;
    }
    res.result = await getPendingNonce(param);
  });
}

export function createPendingTxMiddleware({
  getPendingTransactionByHash,
}: any) {
  return createAsyncMiddleware(async (req: any, res: any, next: any) => {
    const { method, params } = req;
    if (method !== 'eth_getTransactionByHash') {
      next();
      return;
    }
    const [hash] = params;
    const txMeta = getPendingTransactionByHash(hash);
    if (!txMeta) {
      next();
      return;
    }
    res.result = formatTxMetaForRpcResult(txMeta);
  });
}
