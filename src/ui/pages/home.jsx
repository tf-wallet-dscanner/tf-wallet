import { Outlet, useNavigate } from 'react-router-dom';
import Header from 'ui/components/header';

function Home() {
  const navigation = useNavigate();

  return (
    <main className="home">
      <Header />
      <Outlet />
    </main>
  );
}

export default Home;
