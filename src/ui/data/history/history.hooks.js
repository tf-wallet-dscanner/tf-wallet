import { SECOND } from 'app/constants/time';
import { useQueries, useQuery } from 'react-query';

import {
  getErc20TransferHistory,
  getErc721TransferHistory,
  getEthTxHistory,
  getKlaytnTxHistory,
} from './history.api';

export function useGetEthTxHistory({ currentChainId, selectedEOA }, options) {
  return useQuery(
    ['/history/getEthTxHistory', currentChainId, selectedEOA],
    getEthTxHistory,
    {
      retry: false,
      refetchInterval: SECOND * 5,
      ...options,
    },
  );
}

export function useGetErc20TransferHistory(
  { currentChainId, selectedEOA, contractAddress },
  options,
) {
  return useQuery(
    [
      '/history/getErc20TransferHistory',
      currentChainId,
      selectedEOA,
      contractAddress,
    ],
    () => getErc20TransferHistory(contractAddress),
    {
      retry: false,
      refetchInterval: SECOND * 5,
      ...options,
    },
  );
}

export function useGetErc20TransferHistories(
  { currentChainId, selectedEOA, tokens },
  options,
) {
  if (!tokens) return;

  return useQueries(
    tokens?.map((token) => {
      return {
        queryKey: [
          '/history/getErc20TransferHistories',
          currentChainId,
          selectedEOA,
          token.address,
        ],
        queryFn: () => getErc20TransferHistory(token.address),
        ...options,
      };
    }),
  );
}

export function useGetErc721TransferHistory(
  { currentChainId, selectedEOA, contractAddress },
  options,
) {
  return useQuery(
    [
      '/history/getErc721TransferHistory',
      currentChainId,
      selectedEOA,
      contractAddress,
    ],
    () => getErc721TransferHistory(contractAddress),
    {
      retry: false,
      refetchInterval: SECOND * 5,
      ...options,
    },
  );
}

export function useGetKlaytnTxHistory(
  { currentChainId, selectedEOA },
  options,
) {
  return useQuery(
    ['/history/getKlaytnTxHistory', currentChainId, selectedEOA],
    getKlaytnTxHistory,
    {
      retry: false,
      refetchInterval: SECOND * 5,
      ...options,
    },
  );
}
