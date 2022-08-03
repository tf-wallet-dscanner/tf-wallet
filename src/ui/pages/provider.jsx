import { useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';
import Card from 'ui/components/atoms/card';
import { THEME_COLOR } from 'ui/constants/colors';
import { useGetLatestBlock, useGetNetworkVersion } from 'ui/data/provider';

function Provider() {
  const navigation = useNavigate();
  const { data: block } = useGetLatestBlock();
  const { data: networkVersion } = useGetNetworkVersion();

  console.log('block: ', block);
  console.log('networkVersion: ', networkVersion);
  const onNextPage = () => {
    navigation('/');
  };

  return (
    <div style={{ padding: 16 }}>
      <Button className="mb-6" color={THEME_COLOR.WARNING} onClick={onNextPage}>
        Home
      </Button>
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
