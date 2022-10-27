import React, { memo } from 'react';

import Box from '../atoms/box';
import AssetItem from './asset-item';

/**
 *
 * @param {Array<object>} accountTokenList
 * @returns {ReactElement}
 */
function AssetList({ accountTokenList }) {
  const renderAssetList = accountTokenList?.map((token) => (
    <AssetItem key={token.address} {...token} />
  ));
  return <Box as="ul">{renderAssetList}</Box>;
}

export default memo(AssetList);
