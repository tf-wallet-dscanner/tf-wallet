import { isEmpty } from 'lodash';
import { useNavigate, useParams } from 'react-router-dom';
import Box from 'ui/components/atoms/box';
import Button from 'ui/components/atoms/button';
import TextField from 'ui/components/atoms/text-field';
import { transferERC20 } from 'ui/data/token';
// import { useSetUnapprovedTx } from 'ui/data/transaction';
import useNumeric from 'ui/hooks/useNumeric';
import { useTransactionStore } from 'ui/store';
import shallow from 'zustand/shallow';

function InputAddressToken() {
  const navigation = useNavigate();
  const { ca } = useParams();
  const { to, setTo, setIsTransfer, setData, clearTxState } =
    useTransactionStore(
      (state) => ({
        to: state.to,
        setTo: state.setTo,
        clearTxState: state.clearTxState,
        setIsTransfer: state.setIsTransfer,
        setData: state.setData,
      }),
      shallow,
    );
  const [amount, handleNumericAmount] = useNumeric('');

  const handleCancel = () => {
    clearTxState();
    navigation(-1);
  };

  const setTransferRawData = async () => {
    try {
      const rawData = await transferERC20({
        receiver: to,
        amount,
      });
      setTo(ca);
      setIsTransfer(true);
      setData(rawData);
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * unApprovedTx 활용 방법을 알지 못해 일단 주석 처리
   *
   */
  // const { mutate: unApprovedTx } = useSetUnapprovedTx({
  //   onSuccess() {
  //     setDecimalValue(Number(value));
  //   },
  // });

  const updateUnApprovedTx = async () => {
    await setTransferRawData();
    // const txParams = {
    //   to: tokenData.address,
    //   gasPrice: '0x00',
    //   value: '0x00',
    //   type: '0x00',
    //   data: '0x00',
    // };
    // unApprovedTx({ txParams });
    navigation('estimate-token-gas');
  };

  const enableNextBtn = isEmpty(to) || Number(amount) <= 0;

  return (
    <Box>
      <TextField
        className="mb-4 bg-white"
        type="text"
        name="to"
        value={to}
        placeholder="받는 사람 주소 입력"
        onChange={(event) => setTo(event.target.value)}
      />
      <TextField
        className="mb-4 bg-white"
        type="text"
        name="decimalValue"
        defaultValue=""
        value={amount}
        placeholder="전송할 토큰 수량 입력"
        onChange={handleNumericAmount}
      />
      <Box className="grid grid-cols-2 gap-3">
        <Button
          className="font-bold text-base !bg-black"
          onClick={handleCancel}
        >
          취소
        </Button>
        <Button
          className="font-bold text-base !bg-dark-blue"
          disabled={enableNextBtn}
          onClick={updateUnApprovedTx}
        >
          다음
        </Button>
      </Box>
    </Box>
  );
}

export default InputAddressToken;
