import { SECOND } from 'app/constants/time';
import { useMutation, useQuery } from 'react-query';

import {
  addToken,
  getTokens,
  switchAccounts,
  transferERC20,
} from './token.api';

export function useGetTokens(params, options) {
  return useQuery(['/token/getTokens', params], getTokens, {
    retry: false,
    refetchInterval: SECOND * 10,
    ...options,
  });
}

export function useAddToken(options) {
  return useMutation(['/token/addToken'], addToken, {
    retry: false,
    ...options,
  });
}

export function useSwitchAccounts(options) {
  return useQuery(['/token/switchAccounts'], switchAccounts, {
    retry: false,
    ...options,
  });
}

export function useTransferERC20(options) {
  return useMutation(['/token/transferERC20'], transferERC20, {
    ...options,
  });
}
