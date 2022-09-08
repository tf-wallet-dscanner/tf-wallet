import { useMutation, useQuery } from 'react-query';

import {
  getGasFeeEstimatesAndStartPolling,
  sendRawTransaction,
} from './transaction.api';

export function useSendRawTransaction(options) {
  return useMutation(['/transaction/sendRawTransaction'], sendRawTransaction, {
    ...options,
  });
}

export function useGetGasFeeEstimatesAndStartPolling(options) {
  return useQuery(
    ['/transaction/getGasFeeEstimatesAndStartPolling'],
    getGasFeeEstimatesAndStartPolling,
    {
      retry: 2,
      ...options,
    },
  );
}
