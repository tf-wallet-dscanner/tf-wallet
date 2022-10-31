import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from 'ui/components/atoms/avatar';
import Box from 'ui/components/atoms/box';
import Typography from 'ui/components/atoms/typography';

import './asset-item.scss';

/**
 *
 * @param {string} token.address
 * @param {string} token.symbol
 * @param {string} token.balance
 * @param {string?} token.image
 * @returns {ReactElement}
 */
function AssetItem({ address, symbol, balance, image }) {
  const navigation = useNavigate();
  return (
    <Box as="li" className="asset-item">
      <Box className="asset-item__balance">
        {image && <Avatar imgUrl={image} />}
        <Typography className="pl-2 text-shorten">{balance}</Typography>
        <Typography>&nbsp;{symbol}</Typography>
      </Box>
      <Box
        className="asset-item__transfer-btn"
        onClick={() => {
          navigation(`/home/transfer/${address}`);
        }}
      >
        <Typography>[ 토큰 보내기 ]</Typography>
      </Box>
    </Box>
  );
}

export default memo(AssetItem);
