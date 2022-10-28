import { memo } from 'react';

import Box from '../atoms/box';
import EthTransactionItem from './eth-transaction-item';

/**
 *
 * @param {Array<object>} transactionList
 * @returns {ReactElement}
 */
function EthTransactionList({ transactionList }) {
  const renderEthTransactionList = transactionList?.map((tx) => (
    <EthTransactionItem key={tx.hash} {...tx} />
  ));
  return (
    <Box as="ul" className="eth-transaction-list h-[246px] overflow-y-auto">
      {renderEthTransactionList}
    </Box>
  );
}

export default memo(EthTransactionList);
