import {
  MAINNET_CHAIN_ID,
  NETWORK_TO_NAME_MAP,
  NETWORK_TYPE_TO_ID_MAP,
} from 'app/constants/network';
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';
import { THEME_COLOR } from 'ui/constants/colors';
import { useGetCurrentChainId, useSetProviderType } from 'ui/data/provider';
import { useGetGasFeeEstimates } from 'ui/data/transaction';
import { useTransactionStore } from 'ui/store';
import shallow from 'zustand/shallow';

function Transaction() {
  const navigation = useNavigate();
  const { data: estimateData, refetch: refetchGasEstimate } =
    useGetGasFeeEstimates();
  const { data: currentChainId, refetch: getCurrentChainId } =
    useGetCurrentChainId();
  const { mutate } = useSetProviderType({
    onSuccess() {
      getCurrentChainId();
      // 네트워크가 바뀌면 즉시 바뀌도록 해야함
      refetchGasEstimate();
    },
  });
  const { setEstimateData, clearTxState } = useTransactionStore(
    (state) => ({
      setEstimateData: state.setEstimateData,
      clearTxState: state.clearTxState,
    }),
    shallow,
  );

  useEffect(() => {
    if (estimateData) {
      setEstimateData(estimateData);
    }
    return () => clearTxState();
  }, [estimateData]);

  const onNextPage = () => {
    navigation('/');
  };

  const handleProviderTypeChange = (event) => {
    const { value: chainId } = event.target;
    mutate(chainId);
  };

  const sortedNetworkList = Object.values(NETWORK_TYPE_TO_ID_MAP).sort(
    (a, b) => Number(a.networkId) - Number(b.networkId),
  );

  return (
    <div style={{ padding: 16 }}>
      <Button className="mb-6" color={THEME_COLOR.WARNING} onClick={onNextPage}>
        Home
      </Button>
      <select
        name="providers"
        onChange={handleProviderTypeChange}
        defaultValue={MAINNET_CHAIN_ID}
        value={currentChainId}
      >
        {sortedNetworkList.map(({ chainId }, index) => (
          <option key={index} value={chainId}>
            {NETWORK_TO_NAME_MAP[chainId]}
          </option>
        ))}
      </select>
      <br />
      <Outlet />
    </div>
  );
}

export default Transaction;
