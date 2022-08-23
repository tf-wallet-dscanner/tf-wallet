import { useMutation, useQuery } from 'react-query';

import { getStoreAccounts, setStoreSelectedAddress } from './account.api';

export function useGetStoreAccounts(options) {
  return useQuery(['/account/getStoreAccounts'], getStoreAccounts, {
    retry: false,
    ...options,
  });
}

export function useSetStoreSelectedAddress(options) {
  return useMutation(
    ['/account/setStoreSelectedAddress'],
    setStoreSelectedAddress,
    {
      retry: false,
      ...options,
    },
  );
}
