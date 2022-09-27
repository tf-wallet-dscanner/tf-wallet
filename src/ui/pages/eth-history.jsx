import {
  MAINNET_CHAIN_ID,
  NETWORK_TO_NAME_MAP,
  NETWORK_TYPE_TO_ID_MAP,
} from 'app/constants/network';
import { weiHexToEthDec } from 'app/lib/util';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';
import Card from 'ui/components/atoms/card';
import { THEME_COLOR } from 'ui/constants/colors';
import {
  useGetEthTxHistory,
  useGetKlaytnTxHistory,
} from 'ui/data/history/history.hooks';
import { useGetCurrentChainId, useSetProviderType } from 'ui/data/provider';
import { PortStreamContext } from 'ui/store/port';

function EthHistory() {
  const navigation = useNavigate();
  const [ethTxHistory, setEthTxHistory] = useState([]);
  const { data: currentChainId, refetch: getCurrentChainId } =
    useGetCurrentChainId();
  const { data: bgEthTxHistory, refetch: refetchEthTxHistory } =
    useGetEthTxHistory();
  const { data: klaytnTxHistory } = useGetKlaytnTxHistory();
  const { mutate } = useSetProviderType({
    onSuccess() {
      getCurrentChainId();
      refetchEthTxHistory();
    },
  });
  const handleProviderTypeChange = (event) => {
    const { value: chainId } = event.target;
    mutate(chainId);
  };
  const onNextPage = () => {
    navigation('/');
  };
  const { port } = useContext(PortStreamContext);

  const sortedNetworkList = Object.values(NETWORK_TYPE_TO_ID_MAP).sort(
    (a, b) => Number(a.networkId) - Number(b.networkId),
  );

  useEffect(() => {
    port.onMessage.addListener(({ ethTransactions }) => {
      setEthTxHistory(ethTransactions);
    });
  }, [port]);

  useEffect(() => {
    if (bgEthTxHistory) {
      setEthTxHistory(bgEthTxHistory);
    }
  }, [bgEthTxHistory]);

  console.log('klaytnTxHistory: ', klaytnTxHistory);

  return (
    <div className="p-4">
      <Button className="mb-6" color={THEME_COLOR.WARNING} onClick={onNextPage}>
        Home
      </Button>
      <select
        className="mb-2"
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
      {ethTxHistory?.map((tx) => (
        <Card key={tx.hash} title={tx.hash} outlined className="mb-2">
          <div className="border-b-[1px] border-solid border-[#cecece] p-2">
            {tx.txreceipt_status === '1' ? '성공' : '실패'}
          </div>
          <div className="border-[1px] border-solid border-[#cecece] p-2">
            {`받은사람: ${tx.to}`}
          </div>
          <div className="border-[1px] border-solid border-[#cecece] p-2">
            {`금액: ${weiHexToEthDec(tx.value)} ETH`}
          </div>
        </Card>
      ))}
    </div>
  );
}

export default EthHistory;
