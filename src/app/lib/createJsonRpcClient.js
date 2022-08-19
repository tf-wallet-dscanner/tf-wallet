import { createFetchMiddleware } from 'eth-json-rpc-middleware';
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

  const networkMiddleware = mergeMiddleware([
    createChainIdMiddleware(chainId),
    fetchMiddleware,
  ]);

  return { networkMiddleware };
}
