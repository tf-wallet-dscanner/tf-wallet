import { useMutation } from 'react-query';

import { sendRawTransaction } from './transaction.api';

export function useSendRawTransaction(options) {
  return useMutation(['/transaction/sendRawTransaction'], sendRawTransaction, {
    retry: 2,
    ...options,
  });
}
