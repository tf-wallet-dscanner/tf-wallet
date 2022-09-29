import { GAS_ESTIMATE_TYPES, PRIORITY_LEVELS } from 'app/constants/gas';
import { gweiDecToETHDec, makeCorrectNumber } from 'app/lib/util';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from 'ui/components/atoms/box';
import Button from 'ui/components/atoms/button';
import Card from 'ui/components/atoms/card';
import TextField from 'ui/components/atoms/text-field';
import { THEME_COLOR } from 'ui/constants/colors';
import {
  useResetUnapprovedTx,
  useSendRawTransaction,
} from 'ui/data/transaction';
import { useTransactionStore } from 'ui/store';
import shallow from 'zustand/shallow';

function EstimateGas() {
  const navigation = useNavigate();
  const [password, setPassword] = useState('');
  const {
    to,
    decimalValue,
    gas,
    gasPrice,
    estimateData,
    setGasPrice,
    isTransfer,
    data,
  } = useTransactionStore(
    (state) => ({
      to: state.to,
      decimalValue: state.value,
      gas: state.gas,
      gasPrice: state.gasPrice,
      estimateData: state.estimateData,
      setGasPrice: state.setGasPrice,
      isTransfer: state.isTransfer,
      data: state.data,
    }),
    shallow,
  );
  const { mutate: sendTransaction } = useSendRawTransaction({
    onSuccess(txHash) {
      navigation(`/transaction/result/${txHash}`);
    },
  });
  const [gasLevel, setGasLevel] = useState(PRIORITY_LEVELS.MEDIUM);
  const { mutate: resetUnapprovedTx } = useResetUnapprovedTx();

  const handleGasLevelChange = (event) => {
    setGasLevel(event.target.value);
  };

  const handleSendTransactionButtonClick = () => {
    let maxFeePerGas;
    let maxPriorityFeePerGas;
    const { gasFeeEstimates, gasEstimateType } = estimateData;
    if (
      gasEstimateType === GAS_ESTIMATE_TYPES.FEE_MARKET ||
      gasEstimateType === GAS_ESTIMATE_TYPES.LEGACY
    ) {
      const { suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas } =
        gasFeeEstimates[gasLevel];
      maxFeePerGas = suggestedMaxFeePerGas;
      maxPriorityFeePerGas = suggestedMaxPriorityFeePerGas;
    }

    sendTransaction({
      password,
      to,
      decimalValue,
      gas,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      isTransfer,
      data,
    });
  };

  const calculateEthGasPrice = useMemo(() => {
    const { gasFeeEstimates, gasEstimateType } = estimateData;
    let calculateGasPrice;
    if (
      gasEstimateType === GAS_ESTIMATE_TYPES.FEE_MARKET ||
      gasEstimateType === GAS_ESTIMATE_TYPES.LEGACY
    ) {
      const { suggestedMaxFeePerGas } = gasFeeEstimates[gasLevel];
      calculateGasPrice = gas * parseFloat(suggestedMaxFeePerGas);
      setGasPrice(suggestedMaxFeePerGas);
    } else if (gasEstimateType === GAS_ESTIMATE_TYPES.ETH_GASPRICE) {
      const { gasPrice: _gasPrice } = gasFeeEstimates;
      calculateGasPrice = gas * parseFloat(_gasPrice);
      setGasPrice(_gasPrice);
    } else {
      return null;
    }
    const ethDec = gweiDecToETHDec(calculateGasPrice);

    return ethDec;
  }, [gas, gasLevel, estimateData]);

  if (Number.isNaN(calculateEthGasPrice)) {
    return <Card>네트워크 에러발생</Card>;
  }

  // unmount 시점
  useEffect(() => {
    return () => {
      // unApprovedTx 정보 초기화
      resetUnapprovedTx();
    };
  }, []);

  return (
    <div>
      <label htmlFor="password">패스워드</label>
      <TextField
        password
        name="password"
        value={password}
        placeholder="Account1번 패스워드 입력"
        onChange={(event) => setPassword(event.target.value)}
      />
      <Box>
        <Card className="mb-2" title="가스 옵션" outlined>
          <Box className="grid grid-cols-3 gap-2">
            <Box>
              <label htmlFor="low" className="pr-1">
                낮음
              </label>
              <input
                type="radio"
                id="low"
                name="level"
                value={PRIORITY_LEVELS.LOW}
                checked={gasLevel === PRIORITY_LEVELS.LOW}
                onChange={handleGasLevelChange}
              />
            </Box>
            <Box>
              <label htmlFor="medium" className="pr-1">
                보통
              </label>
              <input
                type="radio"
                id="medium"
                name="level"
                value={PRIORITY_LEVELS.MEDIUM}
                checked={gasLevel === PRIORITY_LEVELS.MEDIUM}
                onChange={handleGasLevelChange}
              />
            </Box>
            <Box>
              <label htmlFor="high" className="pr-1">
                높음
              </label>
              <input
                type="radio"
                id="high"
                name="level"
                value={PRIORITY_LEVELS.HIGH}
                checked={gasLevel === PRIORITY_LEVELS.HIGH}
                onChange={handleGasLevelChange}
              />
            </Box>
          </Box>
        </Card>
        <Card
          className="mb-2"
          title="보내는 양"
          content={decimalValue}
          outlined
        />
        <Card className="mb-2" title="가스(예상치)" outlined>
          {calculateEthGasPrice}
        </Card>
        <Card className="mb-2" title="합계(금액+가스요금)" outlined>
          {makeCorrectNumber(decimalValue + calculateEthGasPrice)}
        </Card>
      </Box>
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
