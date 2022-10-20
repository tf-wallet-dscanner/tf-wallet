import { addHexPrefix } from 'ethereumjs-util';
import { isEmpty } from 'lodash';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from 'ui/components/atoms/box';
import Button from 'ui/components/atoms/button';
import TextField from 'ui/components/atoms/text-field';
import { useSetUnapprovedTx } from 'ui/data/transaction/transaction.hooks';
import { useTransactionStore } from 'ui/store';
import shallow from 'zustand/shallow';

function InputAddress() {
  const navigation = useNavigate();
  const { to, setTo, gas, decimalValue, setDecimalValue, clearTxState } =
    useTransactionStore(
      (state) => ({
        to: state.to,
        gas: state.gas,
        setTo: state.setTo,
        decimalValue: state.value,
        setDecimalValue: state.setValue,
        clearTxState: state.clearTxState,
      }),
      shallow,
    );
  const [value, setValue] = useState('');

  const handleNumericValue = (event) => {
    const { value: txValue } = event.target;
    // 숫자만 입력
    if (/^[0-9]*.[0-9]*$/.test(txValue) || isEmpty(txValue)) {
      setValue(txValue);
    }
  };

  const handleCancel = () => {
    clearTxState();
    navigation(-1);
  };

  const { mutate: unApprovedTx } = useSetUnapprovedTx({
    onSuccess() {
      setDecimalValue(Number(value));
      navigation('estimate-gas');
    },
  });

  // 일단 Legacy 버전 진행
  const updateUnApprovedTx = () => {
    const txParams = {
      to,
      gasLimit: addHexPrefix(gas.toString(16)),
      gasPrice: '0x00',
      value: addHexPrefix(parseInt(decimalValue * 10 ** 18, 10).toString(16)),
      type: '0x00',
    };
    unApprovedTx({ txParams });
  };

  const enableNextBtn = isEmpty(to) || Number(value) <= 0;

  return (
    <Box>
      <TextField
        className="bg-white mb-4"
        type="text"
        name="to"
        value={to}
        placeholder="받는 사람 주소 입력"
        onChange={(event) => setTo(event.target.value)}
      />
      <TextField
        className="bg-white mb-4"
        type="text"
        name="decimalValue"
        defaultValue=""
        value={value}
        placeholder="전송할 금액 입력"
        onChange={handleNumericValue}
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

export default InputAddress;
