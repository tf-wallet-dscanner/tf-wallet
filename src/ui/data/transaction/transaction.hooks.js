import { SECOND } from 'app/constants/time';
import { useMutation, useQuery } from 'react-query';

import { getGasFeeEstimates, sendRawTransaction } from './transaction.api';

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
