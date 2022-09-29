import { PollingBlockTracker } from 'eth-block-tracker';
import {
  createBlockCacheMiddleware,
  createBlockRefRewriteMiddleware,
  createBlockTrackerInspectorMiddleware,
  createFetchMiddleware,
  createInflightCacheMiddleware,
  providerFromMiddleware,
} from 'eth-json-rpc-middleware';
import { mergeMiddleware } from 'json-rpc-engine';

function createChainIdMiddleware(chainId) {
  return (req, res, next, end) => {
    if (req.method === 'eth_chainId') {
      res.result = chainId;
      return end();
    }
    return next();
  };
}

export default function createJsonRpcClient({ rpcUrl, chainId }) {
  const fetchMiddleware = createFetchMiddleware({ rpcUrl });
  const blockProvider = providerFromMiddleware(fetchMiddleware);
  const blockTracker = new PollingBlockTracker({
    provider: blockProvider,
  });

  const networkMiddleware = mergeMiddleware([
    createChainIdMiddleware(chainId),
    createBlockRefRewriteMiddleware({ blockTracker }),
    createBlockCacheMiddleware({ blockTracker }),
    createInflightCacheMiddleware(),
    createBlockTrackerInspectorMiddleware({ blockTracker }),
    fetchMiddleware,
  ]);

  return { networkMiddleware, blockTracker };
}
