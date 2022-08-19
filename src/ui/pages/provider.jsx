import {
  MAINNET_CHAIN_ID,
  NETWORK_TO_NAME_MAP,
  NETWORK_TYPE_TO_ID_MAP,
} from 'app/constants/network';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';
import Card from 'ui/components/atoms/card';
import TextField from 'ui/components/atoms/text-field';
import { THEME_COLOR } from 'ui/constants/colors';
import {
  useGetCurrentChainId,
  useGetLatestBlock,
  useSendRawTransaction,
  useSetProviderType,
} from 'ui/data/provider';

function Provider() {
  const navigation = useNavigate();
  const [from, setFrom] = useState();
  const [to, setTo] = useState();
  const [decimalValue, setDecimalValue] = useState(
    100000000000000000 /** 0.1ETH */,
  );
  const { data: block, refetch: getLatestBlock } = useGetLatestBlock();
  const { data: currentChainId, refetch: getCurrentChainId } =
    useGetCurrentChainId();
  const { mutate } = useSetProviderType({
    onSuccess() {
      getLatestBlock();
      getCurrentChainId();
    },
  });
  const { mutate: sendTransaction } = useSendRawTransaction({
    onSuccess(txResult) {
      alert(`txHash: ${txResult}`);
    },
  });

  const onNextPage = () => {
    navigation('/');
  };

  const handleProviderTypeChange = (event) => {
    const { value: chainId } = event.target;
    mutate(chainId);
  };

  const handleSendTransactionButtonClick = () => {
    console.log('handleSendTransactionButtonClick');
    sendTransaction({ from, to, decimalValue });
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
      <label htmlFor="from">보내는사람</label>
      <TextField
        type="text"
        name="from"
        value={from}
        onChange={(event) => setFrom(event.target.value)}
      />
      <label htmlFor="to">받는사람</label>
      <TextField
        type="text"
        name="to"
        value={to}
        onChange={(event) => setTo(event.target.value)}
      />
      <label htmlFor="decimalValue">금액(wei or ston)</label>
      <TextField
        type="text"
        name="decimalValue"
        value={decimalValue}
        onChange={(event) => setDecimalValue(Number(event.target.value))}
      />
      <Button
        className="mb-6"
        color={THEME_COLOR.SUCCESS}
        onClick={handleSendTransactionButtonClick}
      >
        송금하기
      </Button>
      {currentChainId && <Card title="Chain Id" content={currentChainId} />}
      {block && <Card title="Block data" content={JSON.stringify(block)} />}
    </div>
  );
}

export default Provider;
