import create from 'zustand';

import logger from './middlewares/logger';

const initialState = {
  bears: 0,
};

const createState = (set) => ({
  ...initialState,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
});

const useCounterStore = create(logger(createState, 'counter-store'));

export default useCounterStore;
