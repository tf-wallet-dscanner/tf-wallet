import { memo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Box from 'ui/components/atoms/box';

// import { MdOutlineCallMade, MdOutlineCallReceived } from 'react-icons/md';
import './klay-transaction-item.scss';

/**
 *
 * @param {string} token.address
 * @param {string} token.symbol
 * @param {string} token.balance
 * @param {string?} token.image
 * @returns {ReactElement}
 */
function KlayTransactionItem({
  hash,
  from,
  to,
  nonce,
  value,
  gas,
  gasUsed,
  gasPrice,
  txFee,
  timestamp,
}) {
  const navigation = useNavigate();
  const { selectedEOA } = useOutletContext();

  console.log('selectedEOA: ', selectedEOA);

  return (
    <Box as="li" className="klay-transaction-item">
      item
    </Box>
  );
}

export default memo(KlayTransactionItem);
