import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from 'ui/components/atoms/box';
import Button from 'ui/components/atoms/button';
import Container from 'ui/components/atoms/container';
import Tooltip from 'ui/components/atoms/tooltip';
import Typography from 'ui/components/atoms/typography';
import { useResetUnapprovedTx } from 'ui/data/transaction';

function TxResult() {
  const { txHash } = useParams();
  const navigation = useNavigate();
  const { mutate: resetUnapprovedTx } = useResetUnapprovedTx();

  // unmount 시점
  useEffect(() => {
    return () => {
      // unApprovedTx 정보 초기화
      resetUnapprovedTx();
    };
  }, []);

  return (
    <Container>
      <Box className="text-center mt-8">
        <Typography className="text-32">Successful</Typography>
      </Box>
      <Box className="text-center mt-40">
        <Typography className="text-xl">
          Transaction Hash:
          <br />
          <Tooltip className="break-all text-base" message={txHash}>
            <Typography className="text-[#7d7dce] cursor-pointer">
              {txHash}
            </Typography>
          </Tooltip>
        </Typography>
      </Box>
      <Box className="absolute w-full bottom-0">
        <Button
          className="font-bold text-sm !bg-dark-blue"
          onClick={() => navigation('/home')}
        >
          Home
        </Button>
      </Box>
    </Container>
  );
}

export default TxResult;
