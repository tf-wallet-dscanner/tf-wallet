import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Mascot from 'ui/components/atoms/mascot/mascot';
import { useGetStoreAccounts } from 'ui/data/account/account.hooks';

function Intro() {
  const navigation = useNavigate();
  const [password, setPassword] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [mode, setMode] = useState('');
  const { data: accounts, isLoading } = useGetStoreAccounts();

  useEffect(() => {
    if (!isLoading) {
      const accountsToString = JSON.stringify(accounts);
      console.log('JSON.stringify(accounts): ', accountsToString);
      if (!isEmpty(JSON.parse(accountsToString))) {
        navigation('/unlock');
      } else {
        navigation('/welcome');
      }
    }
  }, [isLoading, accounts]);

  return (
    <main className="flex flex-col items-center h-screen p-5 bg-[#05486E]">
      <section>
        <Mascot />
      </section>
      <article className="w-full">
        <Outlet
          context={{
            password,
            setPassword,
            mnemonic,
            setMnemonic,
            mode,
            setMode,
          }}
        />
      </article>
    </main>
  );
}

export default Intro;
