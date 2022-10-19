import { Outlet, useNavigate } from 'react-router-dom';
import AccountView from 'ui/components/account-view/account-view';
import Header from 'ui/components/header';

function Home() {
  const navigation = useNavigate();

  return (
    <main className="home">
      <Header />
      <AccountView />
      <Outlet />
    </main>
  );
}

export default Home;
