import { useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';
import TextField from 'ui/components/atoms/text-field';
import { THEME_COLOR } from 'ui/constants/colors';
import { useTransactionStore } from 'ui/store';
import shallow from 'zustand/shallow';

function InputAddress() {
  const navigation = useNavigate();
  const { to, setTo, decimalValue, setDecimalValue } = useTransactionStore(
    (state) => ({
      to: state.to,
      setTo: state.setTo,
      decimalValue: state.value,
      setDecimalValue: state.setValue,
    }),
    shallow,
  );

  const onNextPage = () => {
    navigation('estimate-gas');
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
      <label htmlFor="decimalValue">금액(wei or ston)</label>
      <TextField
        type="text"
        name="decimalValue"
        value={decimalValue}
        onChange={(event) => setDecimalValue(Number(event.target.value))}
      />
      <Button className="mb-6" color={THEME_COLOR.SUCCESS} onClick={onNextPage}>
        다음
      </Button>
    </div>
  );
}

export default InputAddress;
