import { SECOND } from 'app/constants/time';
import { useMemo } from 'react';
import { useCopyToClipboard, useToggle } from 'react-use';
import Toast from 'ui/components/atoms/toast';
import Tooltip from 'ui/components/atoms/tooltip';

import './selected-account.scss';

function SelectedAccount({ selectedEOA }) {
  const [{ value, error }, copyToClipboard] = useCopyToClipboard();
  const [isShow, toggle] = useToggle(false);
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

  return (
    <section className="selected-account">
      <h1 className="text-2xl">{selectedEOA?.name ?? 'Account 1'}</h1>
      <Tooltip className="mx-auto" message={selectedEOA?.address ?? '0x0'}>
        <h4
          className="selected-account__eoa"
          onClick={() => copyAddress(selectedEOA?.address)}
        >
          {ellipsisAddress}
        </h4>
      </Tooltip>
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
    </section>
  );
}

export default SelectedAccount;
