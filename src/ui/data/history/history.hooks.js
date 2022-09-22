import { SECOND } from 'app/constants/time';
import { useQuery } from 'react-query';

import {
  getErc20TransferHistory,
  getErc721TransferHistory,
  getEthTxHistory,
} from './history.api';

export function useGetEthTxHistory(options) {
  return useQuery(['/history/getEthTxHistory'], getEthTxHistory, {
    retry: false,
    refetchInterval: SECOND * 10,
    ...options,
  });
}

export function useGetErc20TransferHistory(options) {
  return useQuery(
    ['/history/getErc20TransferHistory'],
    getErc20TransferHistory,
    {
      retry: false,
      refetchInterval: SECOND * 10,
      ...options,
    },
  );
}

export function useGetErc721TransferHistory(options) {
  return useQuery(
    ['/history/getErc721TransferHistory'],
    getErc721TransferHistory,
    {
      retry: false,
      refetchInterval: SECOND * 10,
      ...options,
    },
  );
}
