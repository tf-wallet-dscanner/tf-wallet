import {
  NETWORK_TO_NAME_MAP,
  NETWORK_TYPE_TO_ID_MAP,
} from 'app/constants/network';
import { useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';
import Card from 'ui/components/atoms/card';
import { THEME_COLOR } from 'ui/constants/colors';
import { useGetNetworkId, useSetProviderType } from 'ui/data/provider';

function Provider() {
  const navigation = useNavigate();
  const { data: networkId, refetch } = useGetNetworkId();
  const { mutate } = useSetProviderType({
    onSuccess() {
      refetch();
    },
  });

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
      <select name="providers" onChange={handleProviderTypeChange}>
        {sortedNetworkList.map(({ chainId }, index) => (
          <option key={index} value={chainId}>
            {NETWORK_TO_NAME_MAP[chainId]}
          </option>
        ))}
      </select>
      {networkId && (
        <Card title="Network Id" content={JSON.stringify(networkId)} />
      )}
    </div>
  );
}

export default Provider;
