import create from 'zustand';

import logger from './middlewares/logger';

const initialState = {
  nonce: '0x0',
  from: '',
  to: '',
  gas: 0,
  gasPrice: 0,
  value: 100000000000000000, // 0.1ETH
  data: '0x0',
};

const createState = (set) => ({
  ...initialState,
  setTo: (to) => set(() => ({ to })),
  setValue: (decimalValue) => set(() => ({ value: decimalValue })),
});

const useTransactionStore = create(logger(createState, 'trasaction'));

export default useTransactionStore;
