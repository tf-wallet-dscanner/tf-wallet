import { useQuery } from 'react-query';

import { getLatestBlock, getNetworkVersion } from './provider.api';

export function useGetLatestBlock(options) {
  return useQuery(['/provider/getLatestBlock'], getLatestBlock, {
    retry: 2,
    ...options,
  });
}

export function useGetNetworkVersion(options) {
  return useQuery(['/provider/getNetworkVersion'], getNetworkVersion, {
    retry: 2,
    ...options,
  });
}
