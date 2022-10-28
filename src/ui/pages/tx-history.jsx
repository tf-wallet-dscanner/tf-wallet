import {
  BAOBAB_CHAIN_ID,
  CYPRESS_CHAIN_ID,
  GOERLI_CHAIN_ID,
  MAINNET_CHAIN_ID,
} from 'app/constants/network';
import { isEmpty } from 'lodash';
import { useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Box from 'ui/components/atoms/box';
import Typography from 'ui/components/atoms/typography';
import EthTransactionList from 'ui/components/eth-transaction-list';
import KlayTransactionList from 'ui/components/klay-transaction-list';
import {
  useGetErc20TransferHistory,
  useGetEthTxHistory,
  useGetKlaytnTxHistory,
} from 'ui/data/history/history.hooks';

function TxHistory() {
  const navigation = useNavigate();
  const { currentChainId } = useOutletContext();
  const isEthereumNetwork =
    currentChainId === MAINNET_CHAIN_ID || currentChainId === GOERLI_CHAIN_ID;
  const isKlaytnNetwork =
    currentChainId === CYPRESS_CHAIN_ID || currentChainId === BAOBAB_CHAIN_ID;

  const { data: ethTxList } = useGetEthTxHistory({
    enabled: isEthereumNetwork,
  });
  const { data: ethErc20List } = useGetErc20TransferHistory({
    contractAddress: '0xF1a203B2f20247498ccE62DFB76Fd761e64815ED',
    // enabled: isEthereumNetwork,
    enabled: false,
  });
  const { data: klaytnTxHistory } = useGetKlaytnTxHistory({
    enabled: isKlaytnNetwork,
  });

  const ethereumTransactionList = useMemo(() => {
    const txList = [];

    if (!isEmpty(ethTxList)) {
      txList.push(...ethTxList);
    }

    // if (!isEmpty(ethErc20List)) {
    //   txList.push(...ethErc20List);
    // }

    if (!isEmpty(txList)) {
      return txList.sort((a, b) => b.timeStamp - a.timeStamp);
    }

    return txList;
  }, [ethTxList, ethErc20List]);

  return (
    <Box className="mt-4">
      <Box className="grid grid-cols-2">
        <Box
          className="p-4 text-center border-b-[1px] border-solid border-dark-blue cursor-pointer"
          onClick={() => navigation('/home/assets')}
        >
          <Typography className="text-sm">자산</Typography>
        </Box>
        <Box
          className="p-4 text-center cursor-pointer bg-dark-blue"
          onClick={() => navigation('/home/history')}
        >
          <Typography className="text-sm">활동</Typography>
        </Box>
      </Box>
      <Box className="text-center">
        {isEthereumNetwork && (
          <EthTransactionList transactionList={ethTxList} />
        )}
        {isKlaytnNetwork && (
          <KlayTransactionList transactionList={klaytnTxHistory} />
        )}
      </Box>
    </Box>
  );
}

export default TxHistory;
