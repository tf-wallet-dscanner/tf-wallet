import { useMutation, useQuery } from 'react-query';

import { addToken, getTokens, switchAccounts } from './token.api';

export function useGetTokens(options) {
  return useQuery(['/token/getTokens'], getTokens, {
    retry: 2,
    ...options,
  });
}

export function useAddToken(options) {
  return useMutation(['/token/addToken'], addToken, {
    retry: 2,
    ...options,
  });
}

export function useSwitchAccounts(options) {
  return useQuery(['/token/switchAccounts'], switchAccounts, {
    retry: 2,
    ...options,
  });
}
