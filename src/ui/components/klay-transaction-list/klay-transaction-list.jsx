import { memo } from 'react';

import Box from '../atoms/box';
import KlayTransactionItem from './klay-transaction-item';

/**
 *
 * @param {Array<object>} transactionList
 * @returns {ReactElement}
 */
function KlayTransactionList({ transactionList }) {
  const renderKlayTransactionList = transactionList?.map((tx) => (
    <KlayTransactionItem key={tx.hash} {...tx} />
  ));
  return (
    <Box as="ul" className="klay-transaction-list h-[246px] overflow-y-auto">
      {renderKlayTransactionList}
    </Box>
  );
}

export default memo(KlayTransactionList);
