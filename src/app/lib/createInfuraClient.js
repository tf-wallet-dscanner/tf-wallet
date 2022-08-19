import { NETWORK_TYPE_TO_ID_MAP } from 'app/constants/network';
import createInfuraMiddleware from 'eth-json-rpc-infura';
import { createScaffoldMiddleware, mergeMiddleware } from 'json-rpc-engine';

function createNetworkAndChainIdMiddleware({ network }) {
  if (!NETWORK_TYPE_TO_ID_MAP[network]) {
    throw new Error(`createInfuraClient - unknown network "${network}"`);
  }

  const { chainId, networkId } = NETWORK_TYPE_TO_ID_MAP[network];

  return createScaffoldMiddleware({
    eth_chainId: chainId,
    net_version: networkId,
  });
}

export default function createInfuraClient({ network, projectId }) {
  const infuraMiddleware = createInfuraMiddleware({
    network,
    projectId,
    // maxAttempts: 5,
    maxAttempts: 1,
    source: 'metamask',
  });

  const networkMiddleware = mergeMiddleware([
    createNetworkAndChainIdMiddleware({ network }),
    infuraMiddleware,
  ]);

  return { networkMiddleware };
}
