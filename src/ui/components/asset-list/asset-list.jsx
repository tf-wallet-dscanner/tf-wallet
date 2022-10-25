import React, { memo } from 'react';

import Box from '../atoms/box';
import AssetItem from './asset-item';

/**
 *
 * @param {Array<object>} accountTokenList
 * @returns {ReactElement}
 */
function AssetList({ accountTokenList }) {
  accountTokenList = [
    {
      address: '0xF1a203B2f20247498ccE62DFB76Fd761e64815ED',
      symbol: 'DKA',
      balance: 1000000,
    },
  ];
  const renderAssetList = accountTokenList?.map((token) => (
    <AssetItem key={token.address} {...token} />
  ));
  return <Box as="ul">{renderAssetList}</Box>;
}

export default memo(AssetList);
