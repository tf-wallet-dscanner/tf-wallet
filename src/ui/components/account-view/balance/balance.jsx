import { weiHexToEthDec } from 'app/lib/util';
import React from 'react';
import Box from 'ui/components/atoms/box';

function Balance({ balance, symbol = 'KLAY' }) {
  const weiToDecBalance = parseFloat(weiHexToEthDec(balance));

  return (
    <Box className="flex justify-center px-8 text-white">
      <h4
        className="inline-block text-shorten text-2xl"
        title={weiToDecBalance}
      >
        {weiToDecBalance}
      </h4>
      <h4 className="text-2xl">&nbsp;{symbol}</h4>
    </Box>
  );
}

export default Balance;
