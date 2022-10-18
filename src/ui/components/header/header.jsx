import {
  BAOBAB_CHAIN_ID,
  NETWORK_TO_NAME_MAP,
  NETWORK_TYPE_TO_ID_MAP,
} from 'app/constants/network';
import { useNavigate } from 'react-router-dom';
import DkaLogo from 'ui/assets/dka_logo.png';
import { useGetCurrentChainId, useSetProviderType } from 'ui/data/provider';

import './header.scss';

function Header() {
  const navigation = useNavigate();
  const { data: currentChainId, refetch: getCurrentChainId } =
    useGetCurrentChainId();
  const { mutate } = useSetProviderType({
    onSuccess() {
      getCurrentChainId();
    },
  });

  const handleProviderTypeChange = (event) => {
    const { value: chainId } = event.target;
    mutate(chainId);
  };

  const sortedNetworkList = Object.values(NETWORK_TYPE_TO_ID_MAP).sort(
    (a, b) => Number(b.networkId) - Number(a.networkId),
  );

  return (
    <header className="header">
      <div className="header__logo" onClick={() => navigation('/home')}>
        <img src={DkaLogo} alt="logo" />
      </div>
      <div className="header__provider">
        <select
          className="header__provider-select"
          name="providers"
          onChange={handleProviderTypeChange}
          defaultValue={BAOBAB_CHAIN_ID}
          value={currentChainId}
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
