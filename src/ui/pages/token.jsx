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
import { useGetCurrentChainId, useSetProviderType } from 'ui/data/provider';
import { useAddToken, useGetTokens, useSwitchAccounts } from 'ui/data/token';

function Token() {
  const navigation = useNavigate();
  const [tokenAddress, setTokenAddress] = useState();
  const [symbol, setSymbol] = useState();
  const [decimals, setDecimals] = useState(18 /** 1ETH */);
  const { data: currentChainId, refetch: getCurrentChainId } =
    useGetCurrentChainId();
  const { data: accountTokenList, refetch: getAccountTokenList } =
    useGetTokens();
  const { data: currentAccounts, refetch: getSwitchAccounts } =
    useSwitchAccounts();
  const { mutate } = useSetProviderType({
    onSuccess() {
      getCurrentChainId();
    },
  });
  const { mutate: addToken } = useAddToken({
    onSuccess(tokenResult) {
      alert(`add token result: ${tokenResult}`);
      getAccountTokenList();
      getSwitchAccounts();
    },
  });

  const onNextPage = () => {
    navigation('/');
  };

  const handleProviderTypeChange = (event) => {
    const { value: chainId } = event.target;
    mutate(chainId);
  };

  const handleAddTokenButtonClick = () => {
    addToken({ tokenAddress, symbol, decimals });
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
      <label htmlFor="tokenAddress">token contract address</label>
      <TextField
        type="text"
        name="tokenAddress"
        value={tokenAddress}
        onChange={(event) => setTokenAddress(event.target.value)}
      />
      <label htmlFor="symbol">symbol</label>
      <TextField
        type="text"
        name="symbol"
        value={symbol}
        onChange={(event) => setSymbol(event.target.value)}
      />
      <label htmlFor="decimals">decimals</label>
      <TextField
        type="text"
        name="decimals"
        value={decimals}
        onChange={(event) => setDecimals(Number(event.target.value))}
      />
      <Button
        className="mb-6"
        color={THEME_COLOR.SUCCESS}
        onClick={handleAddTokenButtonClick}
      >
        토큰 추가하기
      </Button>
      {currentAccounts && <Card title="EOA" content={currentAccounts} />}
      {accountTokenList && (
        <Card
          title="EOA Token List"
          content={JSON.stringify(accountTokenList)}
        />
      )}
      {currentChainId && <Card title="Chain Id" content={currentChainId} />}
    </div>
  );
}

export default Token;
