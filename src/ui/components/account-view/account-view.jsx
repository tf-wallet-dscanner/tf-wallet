import { useLocation } from 'react-router-dom';
import {
  useGetStoreAccounts,
  useSetStoreSelectedAddress,
} from 'ui/data/account/account.hooks';

import './account-view.scss';
import Balance from './balance';
import DropdownMenu from './dropdown-menu';
import SelectedAccount from './selected-account';

function AccountView() {
  const { pathname } = useLocation();
  const { data: accounts, refetch: updateAccounts } = useGetStoreAccounts();
  const { mutate: updateSelectedAddress } = useSetStoreSelectedAddress({
    onSuccess() {
      updateAccounts();
    },
  });

  const handleAccountChange = (selectedAddress) => {
    updateSelectedAddress(selectedAddress);
  };

  const selectedEOA = accounts?.identities?.find(
    ({ address }) => accounts?.selectedAddress === address,
  );

  return (
    <article className="account-view">
      <SelectedAccount selectedEOA={selectedEOA} />
      <hr className="mb-4" />
      {pathname === '/home' ? (
        <DropdownMenu
          accounts={accounts}
          handleAccountChange={handleAccountChange}
        />
      ) : (
        <Balance balance={selectedEOA?.balance ?? '0x0'} />
      )}
    </article>
  );
}

export default AccountView;
