import { useQuery } from 'react-query';

import { addToken, getTokens } from './token.api';

export function useGetTokens(options) {
  return useQuery(['/token/getToken'], getTokens, {
    retry: 2,
    ...options,
  });
}

export function useAddToken(options) {
  return useQuery(['/token/addToken'], addToken, {
    retry: 2,
    ...options,
  });
}
