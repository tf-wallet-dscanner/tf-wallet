import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';
import TextField from 'ui/components/atoms/text-field';
import { THEME_COLOR } from 'ui/constants/colors';
import { transferERC20 } from 'ui/data/token';
import { useTransactionStore } from 'ui/store';
import shallow from 'zustand/shallow';

function InputAddressToken() {
  const navigation = useNavigate();
  const [amount, setAmount] = useState('');
  const [receiver, setReceiver] = useState('');
  const { setTo, setData, tokenData } = useTransactionStore(
    (state) => ({
      setTo: state.setTo,
      setData: state.setData,
      tokenData: state.tokenData,
    }),
    shallow,
  );

  const onNextPage = () => {
    navigation('/transaction/estimate-gas');
  };

  const setTransferRawData = async () => {
    try {
      console.log('setTransferRawData', tokenData.address, receiver, amount);
      const rawData = await transferERC20({ receiver, amount });
      console.log('transferERC20 rawData', rawData);
      setTo(tokenData.address);
      setData(rawData);
      onNextPage();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <label htmlFor="receiver">받는사람</label>
      <TextField
        type="text"
        name="receiver"
        value={receiver}
        onChange={(event) => setReceiver(event.target.value)}
      />
      <label htmlFor="amount">개수(Token)</label>
      <TextField
        type="text"
        name="amount"
        value={amount}
        onChange={(event) => setAmount(Number(event.target.value))}
      />
      <Button
        className="mb-6"
        color={THEME_COLOR.SUCCESS}
        onClick={setTransferRawData}
      >
        다음
      </Button>
    </div>
  );
}

export default InputAddressToken;
