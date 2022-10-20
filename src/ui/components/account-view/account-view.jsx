import { useLocation } from 'react-router-dom';

import './account-view.scss';
import DropdownMenu from './dropdown-menu';
import SelectedAccount from './selected-account';

function AccountView({ accounts, selectedEOA, handleAccountChange }) {
  const { pathname } = useLocation();

  const isShowDropdownMenu =
    pathname.includes('assets') || pathname.includes('history');

  return (
    <article className="account-view">
      <SelectedAccount selectedEOA={selectedEOA} />
      {isShowDropdownMenu && (
        <DropdownMenu
          accounts={accounts}
          handleAccountChange={handleAccountChange}
        />
      )}
    </article>
  );
}

export default AccountView;
