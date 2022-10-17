export const HARDFORKS = {
  BERLIN: 'berlin',
  LONDON: 'london',
};

export const MAINNET = 'mainnet';
export const GOERLI = 'goerli';
export const LOCALHOST = 'localhost';
export const CYPRESS = 'cypress';
export const BAOBAB = 'baobab';
export const NETWORK_TYPE_RPC = 'rpc';

export const MAINNET_NETWORK_ID = '1';
export const GOERLI_NETWORK_ID = '5';
export const CYPRESS_NETWORK_ID = '8217';
export const BAOBAB_NETWORK_ID = '1001';
export const LOCALHOST_NETWORK_ID = '155';

export const MAINNET_CHAIN_ID = '0x1';
export const GOERLI_CHAIN_ID = '0x5';
export const CYPRESS_CHAIN_ID = '0x2019';
export const BAOBAB_CHAIN_ID = '0x3e9';
export const LOCALHOST_CHAIN_ID = '0x9B';

/**
 * The largest possible chain ID we can handle.
 * Explanation: https://gist.github.com/rekmarks/a47bd5f2525936c4b8eee31a16345553
 */
export const MAX_SAFE_CHAIN_ID = 4503599627370476;

export const MAINNET_DISPLAY_NAME = 'Ethereum Mainnet';
export const GOERLI_DISPLAY_NAME = 'Goerli';
export const CYPRESS_DISPLAY_NAME = 'Cypress';
export const BAOBAB_DISPLAY_NAME = 'Baobab';
export const LOCALHOST_DISPLAY_NAME = 'Localhost 8545';

const infuraProjectId = process.env.INFURA_PROJECT_ID;
export const getRpcUrl = ({ network }) =>
  `https://${network}.infura.io/v3/${infuraProjectId}`;
export const getKlaytnRpcUrl = ({ network }) =>
  `https://public-node-api.klaytnapi.com/v1/${network}`;

export const MAINNET_RPC_URL = getRpcUrl({ network: MAINNET });
export const GOERLI_RPC_URL = getRpcUrl({ network: GOERLI });
export const CYPRESS_RPC_URL = getKlaytnRpcUrl({ network: CYPRESS });
export const BAOBAB_RPC_URL = getKlaytnRpcUrl({ network: BAOBAB });
export const LOCALHOST_RPC_URL = 'http://localhost:8545';

export const INFURA_PROVIDER_TYPES = [MAINNET, GOERLI];
export const KLAYTN_PROVIDER_TYPES = [CYPRESS, BAOBAB];

export const NETWORK_TYPE_TO_ID_MAP = {
  [GOERLI]: {
    networkId: GOERLI_NETWORK_ID,
    chainId: GOERLI_CHAIN_ID,
  },
  [MAINNET]: {
    networkId: MAINNET_NETWORK_ID,
    chainId: MAINNET_CHAIN_ID,
  },
  [CYPRESS]: {
    networkId: CYPRESS_NETWORK_ID,
    chainId: CYPRESS_CHAIN_ID,
  },
  [BAOBAB]: {
    networkId: BAOBAB_NETWORK_ID,
    chainId: BAOBAB_CHAIN_ID,
  },
  [LOCALHOST]: {
    networkId: LOCALHOST_NETWORK_ID,
    chainId: LOCALHOST_CHAIN_ID,
  },
};

export const NETWORK_TO_NAME_MAP = {
  [MAINNET]: MAINNET_DISPLAY_NAME,
  [GOERLI]: GOERLI_DISPLAY_NAME,
  [CYPRESS]: CYPRESS_DISPLAY_NAME,
  [BAOBAB]: BAOBAB_DISPLAY_NAME,
  [LOCALHOST]: LOCALHOST_DISPLAY_NAME,

  [GOERLI_NETWORK_ID]: GOERLI_DISPLAY_NAME,
  [MAINNET_NETWORK_ID]: MAINNET_DISPLAY_NAME,
  [CYPRESS_NETWORK_ID]: CYPRESS_DISPLAY_NAME,
  [BAOBAB_NETWORK_ID]: BAOBAB_DISPLAY_NAME,
  [LOCALHOST_NETWORK_ID]: LOCALHOST_DISPLAY_NAME,

  [GOERLI_CHAIN_ID]: GOERLI_DISPLAY_NAME,
  [MAINNET_CHAIN_ID]: MAINNET_DISPLAY_NAME,
  [CYPRESS_CHAIN_ID]: CYPRESS_DISPLAY_NAME,
  [BAOBAB_CHAIN_ID]: BAOBAB_DISPLAY_NAME,
  [LOCALHOST_CHAIN_ID]: LOCALHOST_DISPLAY_NAME,
};

export const CHAIN_ID_TO_TYPE_MAP = Object.entries(
  NETWORK_TYPE_TO_ID_MAP,
).reduce((chainIdToTypeMap, [networkType, { chainId }]) => {
  chainIdToTypeMap[chainId] = networkType;
  return chainIdToTypeMap;
}, {});

export const CHAIN_ID_TO_RPC_URL_MAP = {
  [GOERLI_CHAIN_ID]: GOERLI_RPC_URL,
  [MAINNET_CHAIN_ID]: MAINNET_RPC_URL,
  [CYPRESS_CHAIN_ID]: CYPRESS_RPC_URL,
  [BAOBAB_CHAIN_ID]: BAOBAB_RPC_URL,
  [LOCALHOST_CHAIN_ID]: LOCALHOST_RPC_URL,
};

export const CHAIN_ID_TO_NETWORK_ID_MAP = Object.values(
  NETWORK_TYPE_TO_ID_MAP,
).reduce((chainIdToNetworkIdMap, { chainId, networkId }) => {
  chainIdToNetworkIdMap[chainId] = networkId;
  return chainIdToNetworkIdMap;
}, {});
