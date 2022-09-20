import { SECOND } from 'app/constants/time';
import { useMutation, useQuery } from 'react-query';

import {
  getGasFeeEstimates,
  getNextNonce,
  sendRawTransaction,
} from './transaction.api';

export function useSendRawTransaction(options) {
  return useMutation(['/transaction/sendRawTransaction'], sendRawTransaction, {
    ...options,
  });
}

export function useGetGasFeeEstimates(options) {
  return useQuery(['/transaction/getGasFeeEstimates'], getGasFeeEstimates, {
    retry: 2,
    refetchInterval: SECOND * 10,
    ...options,
  });
}

export function useGetNextNonce({ address }, options) {
  return useQuery(
    ['/transaction/getNextNonce', address],
    () => getNextNonce(address),
    {
      enabled: false,
      ...options,
    },
  );
}
