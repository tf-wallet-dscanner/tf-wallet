import { FaBeer } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';
import Container from 'ui/components/atoms/container';
import { THEME_COLOR } from 'ui/constants/colors';

function Home() {
  const navigation = useNavigate();

  return (
    <Container className="p-4">
      <Button
        className="mb-10"
        color={THEME_COLOR.ERROR}
        prefixIcon={<FaBeer />}
        onClick={() => navigation('/provider')}
      >
        Provider
      </Button>
      <Button
        color={THEME_COLOR.INFO}
        className="my-5"
        suffixIcon={<FaBeer />}
        onClick={() => {
          navigation('/new-account');
        }}
      >
        New Account
      </Button>
      <Button
        color={THEME_COLOR.SUCCESS}
        className="my-5"
        suffixIcon={<FaBeer />}
        onClick={() => {
          navigation('/import-account');
        }}
      >
        Import Account
      </Button>
    </Container>
  );
}

export default Home;
