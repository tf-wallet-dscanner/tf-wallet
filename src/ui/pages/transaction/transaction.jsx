import {
  MAINNET_CHAIN_ID,
  NETWORK_TO_NAME_MAP,
  NETWORK_TYPE_TO_ID_MAP,
} from 'app/constants/network';
import { Outlet, useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';
import { THEME_COLOR } from 'ui/constants/colors';
import { useGetCurrentChainId, useSetProviderType } from 'ui/data/provider';
import { useGetGasFeeEstimatesAndStartPolling } from 'ui/data/transaction';

function Transaction() {
  const navigation = useNavigate();
  const { data } = useGetGasFeeEstimatesAndStartPolling();
  const { data: currentChainId, refetch: getCurrentChainId } =
    useGetCurrentChainId();
  const { mutate } = useSetProviderType({
    onSuccess() {
      getCurrentChainId();
    },
  });

  console.log('data: ', data);

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