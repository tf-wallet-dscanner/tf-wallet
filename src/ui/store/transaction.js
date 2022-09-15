import {
  GAS_ESTIMATE_TYPES,
  MIN_GAS_LIMIT_DEC,
  MIN_GAS_PRICE_DEC,
} from 'app/constants/gas';
import create from 'zustand';

import logger from './middlewares/logger';

const initialState = {
  nonce: '0x0',
  from: '',
  to: '',
  gas: MIN_GAS_LIMIT_DEC,
  gasPrice: MIN_GAS_PRICE_DEC,
  value: 0.1, // 0.1ETH === 100000000000000000 wei
  data: '0x0',
  estimateData: {
    gasFeeEstimates: {},
    estimatedGasFeeTimeBounds: {},
    gasEstimateType: GAS_ESTIMATE_TYPES.NONE,
  }, // gas estimate data
};

const createState = (set) => ({
  ...initialState,
  setTo: (to) => set(() => ({ to })),
  setValue: (decimalValue) => set(() => ({ value: decimalValue })),
  setEstimateData: (estimateData) => set(() => ({ estimateData })),
  setGasPrice: (gasPrice) => set(() => ({ gasPrice })),
  clearTxState: () => set(() => ({ ...initialState })),
});

const useTransactionStore = create(logger(createState, 'trasaction'));

export default useTransactionStore;
