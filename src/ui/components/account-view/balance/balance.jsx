import { weiHexToEthDec } from 'app/lib/util';
import { memo } from 'react';
import Box from 'ui/components/atoms/box';
import Typography from 'ui/components/atoms/typography';

function Balance({ balance, symbol = 'KLAY' }) {
  const weiToDecBalance = parseFloat(weiHexToEthDec(balance));

  return (
    <Box className="flex justify-center px-8 text-white">
      <Typography
        as="h4"
        className="inline-block text-2xl text-shorten"
        title={weiToDecBalance}
      >
        {weiToDecBalance}
      </Typography>
      <Typography as="h4" className="text-2xl">
        &nbsp;{symbol}
      </Typography>
    </Box>
  );
}

export default memo(Balance);
