import {
  NETWORK_TO_NAME_MAP,
  NETWORK_TYPE_TO_ID_MAP,
} from 'app/constants/network';
import { useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';
import Card from 'ui/components/atoms/card';
import { THEME_COLOR } from 'ui/constants/colors';
import { useGetLatestBlock, useGetNetworkVersion } from 'ui/data/provider';

function Provider() {
  const navigation = useNavigate();
  const { data: block } = useGetLatestBlock();
  const { data: networkVersion } = useGetNetworkVersion();

  const onNextPage = () => {
    navigation('/');
  };

  const sortedNetworkList = Object.values(NETWORK_TYPE_TO_ID_MAP).sort(
    (a, b) => Number(a.networkId) - Number(b.networkId),
  );

  return (
    <div style={{ padding: 16 }}>
      <Button className="mb-6" color={THEME_COLOR.WARNING} onClick={onNextPage}>
        Home
      </Button>
      <select name="providers">
        {sortedNetworkList.map(({ network, chainId }) => (
          <option key={network} value={chainId}>
            {NETWORK_TO_NAME_MAP[chainId]}
          </option>
        ))}
      </select>
      {block && <Card title="Block data" content={JSON.stringify(block)} />}
      {networkVersion && (
        <Card
          title="Network version"
          content={JSON.stringify(networkVersion)}
        />
      )}
    </div>
  );
}

export default Provider;
