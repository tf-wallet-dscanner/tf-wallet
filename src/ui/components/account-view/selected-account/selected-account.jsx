import { SECOND } from 'app/constants/time';
import { useMemo } from 'react';
import { MdContentCopy } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import { useCopyToClipboard, useToggle } from 'react-use';
import Box from 'ui/components/atoms/box';
import Toast from 'ui/components/atoms/toast';
import Tooltip from 'ui/components/atoms/tooltip';
import Typography from 'ui/components/atoms/typography';
import { useGetTokens } from 'ui/data/token';

import './selected-account.scss';

function SelectedAccount({ selectedEOA }) {
  const params = useParams();
  const { data: accountTokenList } = useGetTokens();
  const [{ value, error }, copyToClipboard] = useCopyToClipboard();
  const [isShow, toggle] = useToggle(false);

  const selectedToken = accountTokenList?.find(
    (token) => token?.address === params?.ca,
  );
  const ellipsisAddress = useMemo(() => {
    if (selectedEOA) {
      const { address } = selectedEOA;
      const prefix = address.slice(0, 5);
      const suffix = address.slice(-4);
      return `${prefix}...${suffix}`;
    }
    return '0x0';
  }, [selectedEOA]);

  const copyAddress = (eoa = '0x0') => {
    copyToClipboard(eoa);
    toggle();
    setTimeout(toggle, SECOND);
  };

  const renderContractAddress = () => {
    if (params?.ca) {
      return (
        <Box className="selected-account__contract">
          <Typography>Token Address</Typography>
          <Typography>{params?.ca}</Typography>
          {selectedToken && (
            <Typography>{`${selectedToken.balance} ${selectedToken.symbol}`}</Typography>
          )}
        </Box>
      );
    }
  };

  return (
    <Box className="selected-account">
      <Typography as="h1" className="text-2xl">
        {selectedEOA?.name ?? 'Account 1'}
      </Typography>
      <Tooltip className="mx-auto" message={selectedEOA?.address ?? '0x0'}>
        <Typography
          as="h4"
          className="selected-account__eoa"
          onClick={() => copyAddress(selectedEOA?.address)}
        >
          {ellipsisAddress}
          <MdContentCopy className="inline ml-2" />
        </Typography>
      </Tooltip>
      {renderContractAddress()}
      {value && (
        <Toast isShow={isShow} severity="success" contents="copied!!" />
      )}
      {error && (
        <Toast
          isShow={isShow}
          severity="error"
          contents="Unable to copy value!"
        />
      )}
    </Box>
  );
}

export default SelectedAccount;
