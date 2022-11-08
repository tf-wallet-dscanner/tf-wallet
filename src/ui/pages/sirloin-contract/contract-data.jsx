import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Box from 'ui/components/atoms/box';
import Button from 'ui/components/atoms/button';
import Tooltip from 'ui/components/atoms/tooltip';
import Typography from 'ui/components/atoms/typography';
import { useTransactionStore } from 'ui/store';
import shallow from 'zustand/shallow';

function ContractData() {
  const navigation = useNavigate();
  const { ca } = useParams();
  const location = useLocation();
  const type = location?.state?.type;
  const method = location?.state?.method;
  const inputData = location?.state?.inputData;
  const { setTo, setIsTransfer, setData, clearTxState } = useTransactionStore(
    (state) => ({
      setTo: state.setTo,
      clearTxState: state.clearTxState,
      setIsTransfer: state.setIsTransfer,
      setData: state.setData,
    }),
    shallow,
  );

  const handleCancel = () => {
    clearTxState();
    navigation('/home/assets');
  };

  const setTransferRawData = async () => {
    try {
      setTo(ca);
      setIsTransfer(true);
      setData(inputData);
    } catch (e) {
      console.error(e);
    }
  };

  const updateUnApprovedTx = async () => {
    await setTransferRawData();
    navigation('estimate-contract-gas');
  };

  const ellipsisInputData = useMemo(() => {
    if (inputData) {
      const prefix = inputData.slice(0, 5);
      const suffix = inputData.slice(-4);
      return `${prefix}...${suffix}`;
    }
    return '0x0';
  }, [inputData]);

  return (
    <Box>
      <Box className="flex flex-col p-4">
        <Typography className="mb-2">ContractAddress: {ca}</Typography>
        <Tooltip message={method}>
          <Typography className="mb-2">method: {type}</Typography>
        </Tooltip>
        <Tooltip message={inputData}>
          <Typography className="mb-2">
            inputData: <Typography>{ellipsisInputData}</Typography>
          </Typography>
        </Tooltip>
      </Box>
      <Box className="grid grid-cols-2 gap-3">
        <Button
          className="font-bold text-base !bg-black"
          onClick={handleCancel}
        >
          취소
        </Button>
        <Button
          className="font-bold text-base !bg-dark-blue"
          onClick={updateUnApprovedTx}
        >
          다음
        </Button>
      </Box>
    </Box>
  );
}

export default ContractData;
