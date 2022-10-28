import { SECOND } from 'app/constants/time';
import { useQueries, useQuery } from 'react-query';

import {
  getErc20TransferHistory,
  getErc721TransferHistory,
  getEthTxHistory,
  getKlaytnTxHistory,
} from './history.api';

export function useGetEthTxHistory(options) {
  return useQuery(['/history/getEthTxHistory'], getEthTxHistory, {
    retry: false,
    refetchInterval: SECOND * 5,
    ...options,
  });
}

export function useGetErc20TransferHistory({ contractAddress }, options) {
  return useQuery(
    ['/history/getErc20TransferHistory', contractAddress],
    () => getErc20TransferHistory(contractAddress),
    {
      retry: false,
      refetchInterval: SECOND * 5,
      ...options,
    },
  );
}

export function useGetErc20TransferHistories({ tokens }, options) {
  if (!tokens) return;

  return useQueries(
    tokens?.map((token) => {
      return {
        queryKey: ['/history/getErc20TransferHistories', token.address],
        queryFn: () => getErc20TransferHistory(token.address),
        ...options,
      };
    }),
  );
}

export function useGetErc721TransferHistory({ contractAddress }, options) {
  return useQuery(
    ['/history/getErc721TransferHistory', contractAddress],
    () => getErc721TransferHistory(contractAddress),
    {
      retry: false,
      refetchInterval: SECOND * 5,
      ...options,
    },
  );
}

export function useGetKlaytnTxHistory(options) {
  return useQuery(['/history/getKlaytnTxHistory'], getKlaytnTxHistory, {
    retry: false,
    refetchInterval: SECOND * 5,
    ...options,
  });
}
