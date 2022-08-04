import { useQuery } from 'react-query';

import { getLatestBlock, getNetworkId } from './provider.api';

export function useGetLatestBlock(options) {
  return useQuery(['/provider/getLatestBlock'], getLatestBlock, {
    retry: 2,
    ...options,
  });
}

export function useGetNetworkId(options) {
  return useQuery(['/provider/getNetworkId'], getNetworkId, {
    retry: 2,
    ...options,
  });
}
