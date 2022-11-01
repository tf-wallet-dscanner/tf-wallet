import { SECOND } from 'app/constants/time';
import { useMutation, useQuery } from 'react-query';

import {
  getGasFeeEstimates,
  getNextNonce,
  getTransferEstimateGas,
  resetUnapprovedTx,
  sendRawTransaction,
  setUnapprovedTx,
} from './transaction.api';

export function useGetTransferEstimateGas(gasEstimateParams, options) {
  return useQuery(
    ['/transaction/getTransferEstimateGas', gasEstimateParams],
    () => getTransferEstimateGas(gasEstimateParams),
    {
      retry: 2,
      refetchInterval: SECOND * 10,
      ...options,
    },
  );
}

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

export function useSetUnapprovedTx(options) {
  return useMutation(['/transaction/setUnapprovedTx'], setUnapprovedTx, {
    ...options,
  });
}

export function useResetUnapprovedTx(options) {
  return useMutation(['/transaction/resetUnapprovedTx'], resetUnapprovedTx, {
    ...options,
  });
}
