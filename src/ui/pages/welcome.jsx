import { useNavigate } from 'react-router-dom';
import Box from 'ui/components/atoms/box';
import Button from 'ui/components/atoms/button';

function Welcome() {
  const navigation = useNavigate();

  const handleNextPage = (mode) => {
    navigation(`/create-password/${mode}`);
  };

  return (
    <Box className="welcome">
      <Button
        type="button"
        className="mb-6 font-bold text-base !bg-dark-blue"
        onClick={() => handleNextPage('create')}
      >
        Create Wallet
      </Button>
      <Button
        type="button"
        className="font-bold text-base !bg-dark-blue"
        onClick={() => handleNextPage('restore')}
      >
        Restore Wallet
      </Button>
    </Box>
  );
}

export default Welcome;
