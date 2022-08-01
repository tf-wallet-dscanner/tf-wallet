import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';
import { THEME_COLOR } from 'ui/constants/colors';

import { BackgroundMessages } from '../../app/messages';
import Messenger from '../../app/messenger';

function Provider() {
  const navigation = useNavigate();
  const [ethAccounts, setEthAccounts] = useState([]);

  const onNextPage = () => {
    navigation('/');
  };

  const getEthereumAccounts = async () => {
    try {
      const { accounts } = await Messenger.sendMessageToBackground(
        BackgroundMessages.GET_ACCOUNTS,
      );
      setEthAccounts(accounts);
    } catch (err) {
      console.log('eventHello err', err);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <Button className="mb-6" onClick={onNextPage}>
        Home
      </Button>
      <Button
        className="mb-6"
        color={THEME_COLOR.WARNING}
        onClick={getEthereumAccounts}
      >
        getEthereumAccounts
      </Button>
      {ethAccounts.map((account, idx) => (
        <div key={idx} className="mb-2">
          {account}
        </div>
      ))}
    </div>
  );
}

export default Provider;
