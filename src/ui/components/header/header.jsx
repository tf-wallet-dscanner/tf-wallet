import {
  BAOBAB_CHAIN_ID,
  NETWORK_TO_NAME_MAP,
  NETWORK_TYPE_TO_ID_MAP,
} from 'app/constants/network';
import { useLocation, useNavigate } from 'react-router-dom';
import DkaLogo from 'ui/assets/dka_logo.png';

import './header.scss';

function Header({ currentChainId, changeProviderType }) {
  const navigation = useNavigate();
  const { pathname } = useLocation();

  const handleProviderTypeChange = (event) => {
    const { value: chainId } = event.target;
    changeProviderType(chainId);
  };

  const sortedNetworkList = Object.values(NETWORK_TYPE_TO_ID_MAP).sort(
    (a, b) => Number(b.networkId) - Number(a.networkId),
  );

  const canChangeProvider =
    !pathname.includes('assets') && !pathname.includes('history');

  return (
    <header className="header">
      <div className="header__logo" onClick={() => navigation('/home/assets')}>
        <img src={DkaLogo} alt="logo" />
      </div>
      <div className="header__provider">
        <select
          className="header__provider-select"
          name="providers"
          onChange={handleProviderTypeChange}
          defaultValue={BAOBAB_CHAIN_ID}
          value={currentChainId}
          disabled={canChangeProvider}
        >
          {sortedNetworkList.map(({ chainId }, index) => (
            <option key={index} value={chainId}>
              {NETWORK_TO_NAME_MAP[chainId]}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}

export default Header;
