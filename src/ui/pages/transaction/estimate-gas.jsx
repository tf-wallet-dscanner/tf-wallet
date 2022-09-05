import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';
import TextField from 'ui/components/atoms/text-field';
import { THEME_COLOR } from 'ui/constants/colors';
import { useSendRawTransaction } from 'ui/data/transaction';
import { useTransactionStore } from 'ui/store';
import shallow from 'zustand/shallow';

function EstimateGas() {
  const navigation = useNavigate();
  const [password, setPassword] = useState();
  const [to, decimalValue] = useTransactionStore(
    (state) => [state.to, state.value],
    shallow,
  );
  const { mutate: sendTransaction } = useSendRawTransaction({
    onSuccess(txHash) {
      navigation(`result/${txHash}`);
    },
  });

  const handleSendTransactionButtonClick = () => {
    sendTransaction({ password, to, decimalValue });
  };

  return (
    <div>
      <label htmlFor="password">패스워드</label>
      <TextField
        password
        name="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <Button
        className="mb-6"
        color={THEME_COLOR.SUCCESS}
        onClick={handleSendTransactionButtonClick}
      >
        보내기
      </Button>
    </div>
  );
}

export default EstimateGas;
