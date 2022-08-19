import { useMutation, useQuery } from 'react-query';

import {
  getCurrentChainId,
  getLatestBlock,
  getNetworkId,
  sendRawTransaction,
  setProviderType,
  setRpcTarget,
} from './provider.api';

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

export function useSetRpcTarget(options) {
  return useMutation(['/provider/setRpcTarget'], setRpcTarget, {
    retry: false,
    ...options,
  });
}

export function useSetProviderType(options) {
  return useMutation(['/provider/setProviderType'], setProviderType, {
    retry: false,
    ...options,
  });
}

export function useGetCurrentChainId(options) {
  return useQuery(['/provider/getCurrentChainId'], getCurrentChainId, {
    retry: 2,
    ...options,
  });
}

export function useSendRawTransaction(options) {
  return useMutation(['/provider/sendRawTransaction'], sendRawTransaction, {
    retry: 2,
    ...options,
  });
}
