import { addHexPrefix } from 'ethereumjs-util';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';
import TextField from 'ui/components/atoms/text-field';
import { THEME_COLOR } from 'ui/constants/colors';
import { useSetUnapprovedTx } from 'ui/data/transaction/transaction.hooks';
import { useTransactionStore } from 'ui/store';
import shallow from 'zustand/shallow';

function InputAddress() {
  const navigation = useNavigate();
  const { to, setTo, gas, decimalValue, setDecimalValue } = useTransactionStore(
    (state) => ({
      to: state.to,
      gas: state.gas,
      setTo: state.setTo,
      decimalValue: state.value,
      setDecimalValue: state.setValue,
    }),
    shallow,
  );
  const [value, setValue] = useState(decimalValue);

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

  return (
    <div>
      <label htmlFor="to">받는사람</label>
      <TextField
        type="text"
        name="to"
        value={to}
        onChange={(event) => setTo(event.target.value)}
      />
      <label htmlFor="decimalValue">금액(ETH or KLAY)</label>
      <TextField
        type="text"
        name="decimalValue"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <Button
        className="mb-6"
        color={THEME_COLOR.SUCCESS}
        onClick={updateUnApprovedTx}
      >
        다음
      </Button>
    </div>
  );
}

export default InputAddress;
