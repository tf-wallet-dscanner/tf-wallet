import {
  GAS_ESTIMATE_TYPES,
  MIN_GAS_LIMIT_DEC,
  MIN_GAS_PRICE_DEC,
} from 'app/constants/gas';
import create from 'zustand';

import logger from './middlewares/logger';

const initialState = {
  nonce: '0x00',
  from: '',
  to: '',
  gas: MIN_GAS_LIMIT_DEC,
  gasPrice: MIN_GAS_PRICE_DEC,
  value: 0, // 0.1ETH === 100000000000000000 wei
  amount: 0, // 보내는 token 수량
  data: '0x00',
  estimateData: {
    gasFeeEstimates: {},
    estimatedGasFeeTimeBounds: {},
    gasEstimateType: GAS_ESTIMATE_TYPES.NONE,
  }, // gas estimate data
  isTransfer: false,
  tokenData: {
    address: '',
    balance: '',
    decimals: '',
    symbol: '',
  },
};

const createState = (set) => ({
  ...initialState,
  setTo: (to) => set(() => ({ to })),
  setValue: (decimalValue) => set(() => ({ value: decimalValue })),
  setTokenAmount: (amount) => set(() => ({ amount })),
  setEstimateData: (estimateData) => set(() => ({ estimateData })),
  setGasPrice: (gasPrice) => set(() => ({ gasPrice })),
  setIsTransfer: (isTransfer) => set(() => ({ isTransfer })),
  setTokenData: (tokenData) => set(() => ({ tokenData })),
  setData: (data) => set(() => ({ data })),
  clearTxState: () => set(() => ({ ...initialState })),
});

const useTransactionStore = create(logger(createState, 'trasaction'));

export default useTransactionStore;
