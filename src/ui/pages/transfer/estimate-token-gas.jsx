import { GAS_ESTIMATE_TYPES, PRIORITY_LEVELS } from 'app/constants/gas';
import { SECOND } from 'app/constants/time';
import { gweiDecToETHDec, makeCorrectNumber } from 'app/lib/util';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import { GrFormClose } from 'react-icons/gr';
import { useNavigate } from 'react-router-dom';
import { useToggle } from 'react-use';
import Box from 'ui/components/atoms/box';
import Button from 'ui/components/atoms/button';
import Card from 'ui/components/atoms/card';
import Toast from 'ui/components/atoms/toast';
import Typography from 'ui/components/atoms/typography';
import {
  useResetUnapprovedTx,
  useSendRawTransaction,
} from 'ui/data/transaction';
import { useTransactionStore } from 'ui/store';
import shallow from 'zustand/shallow';

function EstimateTokenGas() {
  const _MIN_GAS_LIMIT_DEC = 21000;
  const navigation = useNavigate();
  const {
    to,
    decimalValue,
    gas,
    gasPrice,
    estimateData,
    setGasPrice,
    isTransfer,
    data,
    clearTxState,
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
      clearTxState: state.clearTxState,
    }),
    shallow,
  );
  const [isShow, toggle] = useToggle(false);
  const modelRef = useRef(null);
  const { mutate: sendTransaction } = useSendRawTransaction({
    onSuccess(txHash) {
      if (txHash.startsWith('0x') && txHash.length === 66) {
        navigation(`/tx-success/${txHash}`);
      }
      toggle();
      setTimeout(toggle, SECOND);
    },
    onError() {
      toggle();
      setTimeout(toggle, SECOND);
    },
  });
  const [gasLevel, setGasLevel] = useState(PRIORITY_LEVELS.MEDIUM);
  const { mutate: resetUnapprovedTx } = useResetUnapprovedTx();

  const handleGasLevelChange = (gasOption) => {
    modelRef?.current?.click();
    setGasLevel(gasOption);
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

  const calculateEthGasPrice = useCallback(
    (_gasLevel) => {
      const { gasFeeEstimates, gasEstimateType } = estimateData;
      let calculateGasPrice;
      if (
        gasEstimateType === GAS_ESTIMATE_TYPES.FEE_MARKET ||
        gasEstimateType === GAS_ESTIMATE_TYPES.LEGACY
      ) {
        const { suggestedMaxFeePerGas } = gasFeeEstimates[_gasLevel];
        calculateGasPrice =
          _MIN_GAS_LIMIT_DEC * parseFloat(suggestedMaxFeePerGas);
        setGasPrice(suggestedMaxFeePerGas);
      } else if (gasEstimateType === GAS_ESTIMATE_TYPES.ETH_GASPRICE) {
        const { gasPrice: _gasPrice } = gasFeeEstimates;
        calculateGasPrice = _MIN_GAS_LIMIT_DEC * parseFloat(_gasPrice);
        setGasPrice(_gasPrice);
      } else {
        return null;
      }
      const ethDec = gweiDecToETHDec(calculateGasPrice);

      return ethDec;
    },
    [estimateData],
  );

  const tranformGasEstimate = useMemo(() => {
    const { gasFeeEstimates, gasEstimateType } = estimateData;
    if (
      gasEstimateType === GAS_ESTIMATE_TYPES.FEE_MARKET ||
      gasEstimateType === GAS_ESTIMATE_TYPES.LEGACY
    ) {
      return {
        [PRIORITY_LEVELS.LOW]:
          gasFeeEstimates[PRIORITY_LEVELS.LOW].suggestedMaxFeePerGas,
        [PRIORITY_LEVELS.MEDIUM]:
          gasFeeEstimates[PRIORITY_LEVELS.MEDIUM].suggestedMaxFeePerGas,
        [PRIORITY_LEVELS.HIGH]:
          gasFeeEstimates[PRIORITY_LEVELS.HIGH].suggestedMaxFeePerGas,
      };
    } else if (gasEstimateType === GAS_ESTIMATE_TYPES.ETH_GASPRICE) {
      const { gasPrice: _gasPrice } = gasFeeEstimates;
      return {
        [PRIORITY_LEVELS.LOW]: _gasPrice,
        [PRIORITY_LEVELS.MEDIUM]: _gasPrice,
        [PRIORITY_LEVELS.HIGH]: _gasPrice,
      };
    }
  }, [estimateData]);

  // EIP-1559 Transaction Fee = ( BaseFee + PriorityFee ) * gasUsed
  const getBaseGasEstimate = () => {
    const { gasFeeEstimates, gasEstimateType } = estimateData;
    let calculateGasPrice;
    if (
      gasEstimateType === GAS_ESTIMATE_TYPES.FEE_MARKET ||
      gasEstimateType === GAS_ESTIMATE_TYPES.LEGACY
    ) {
      const { estimatedBaseFee } = gasFeeEstimates;
      const { suggestedMaxPriorityFeePerGas } = gasFeeEstimates[gasLevel];
      calculateGasPrice =
        _MIN_GAS_LIMIT_DEC *
        parseFloat(estimatedBaseFee + suggestedMaxPriorityFeePerGas);
    } else if (gasEstimateType === GAS_ESTIMATE_TYPES.ETH_GASPRICE) {
      const { gasPrice: _gasPrice } = gasFeeEstimates;
      calculateGasPrice = _MIN_GAS_LIMIT_DEC * parseFloat(_gasPrice);
    } else {
      return 0;
    }
    const ethDec = gweiDecToETHDec(calculateGasPrice);

    return ethDec;
  };

  const getMaxGasEstimate = (_gasPrice) => {
    return gweiDecToETHDec(_MIN_GAS_LIMIT_DEC * parseFloat(_gasPrice));
  };

  if (Number.isNaN(calculateEthGasPrice)) {
    return <Card>네트워크 에러발생</Card>;
  }

  // unmount 시점
  useEffect(() => {
    return () => {
      // unApprovedTx 정보 초기화
      resetUnapprovedTx();
      clearTxState();
    };
  }, []);

  return (
    <Box className="estimate-gas">
      <Box className="mb-2 text-right">
        <label
          className="text-red-500 cursor-pointer"
          htmlFor="estimate-gas__modal"
        >
          <FaGasPump className="inline" /> Market &gt;
        </label>
      </Box>
      <input
        ref={modelRef}
        type="checkbox"
        id="estimate-gas__modal"
        className="modal-toggle"
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="flex justify-between">
            <Typography className="font-bold text-lg text-left !text-black">
              가스 요금 편집
            </Typography>
            <label htmlFor="estimate-gas__modal">
              <GrFormClose className="text-2xl text-white cursor-pointer" />
            </label>
          </h3>
          <hr className="mt-2 mb-4" />
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>가스옵션</th>
                  <th>최대 요금</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  className={classNames('hover', {
                    active: gasLevel === PRIORITY_LEVELS.LOW,
                  })}
                  onClick={() => handleGasLevelChange(PRIORITY_LEVELS.LOW)}
                >
                  <th>낮음</th>
                  <td>
                    {getMaxGasEstimate(
                      tranformGasEstimate[PRIORITY_LEVELS.LOW],
                    )}
                  </td>
                </tr>
                <tr
                  className={classNames('hover', {
                    active: gasLevel === PRIORITY_LEVELS.MEDIUM,
                  })}
                  onClick={() => handleGasLevelChange(PRIORITY_LEVELS.MEDIUM)}
                >
                  <th>보통</th>
                  <td>
                    {getMaxGasEstimate(
                      tranformGasEstimate[PRIORITY_LEVELS.MEDIUM],
                    )}
                  </td>
                </tr>
                <tr
                  className={classNames('hover', {
                    active: gasLevel === PRIORITY_LEVELS.HIGH,
                  })}
                  onClick={() => handleGasLevelChange(PRIORITY_LEVELS.HIGH)}
                >
                  <th>높음</th>
                  <td>
                    {getMaxGasEstimate(
                      tranformGasEstimate[PRIORITY_LEVELS.HIGH],
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Box className="grid items-center grid-cols-2 py-2">
        <Box>
          <Typography className="text-sm font-bold">가스</Typography>
          <Typography className="!text-gray-500 italic text-xs">
            &nbsp;(예상치)
          </Typography>
        </Box>
        <Box className="text-right">
          <Typography className="text-sm font-bold">
            {getBaseGasEstimate()} KLAY
          </Typography>
          <br />
          <Typography className="text-xs">
            최대 요금: {calculateEthGasPrice(gasLevel)} KLAY
          </Typography>
        </Box>
      </Box>
      <hr className="my-4" />
      <Box className="grid items-center grid-cols-2 py-2">
        <Box>
          <Typography className="text-sm font-bold">합계</Typography>
          <Typography className="!text-gray-500 italic text-xs">
            &nbsp;(금액 + 가스 요금)
          </Typography>
        </Box>
        <Box className="text-right">
          <Typography className="text-sm font-bold">
            {makeCorrectNumber(decimalValue + getBaseGasEstimate())}
            &nbsp; KLAY
          </Typography>
          <br />
          <Typography className="text-xs">
            최대 요금:&nbsp;
            {makeCorrectNumber(decimalValue + calculateEthGasPrice(gasLevel))}
            &nbsp; KLAY
          </Typography>
        </Box>
      </Box>
      <Box className="grid grid-cols-2 gap-3 mt-8">
        <Button
          className="font-bold text-base !bg-black"
          onClick={() => navigation(-1)}
        >
          취소
        </Button>
        <Button
          className="font-bold text-base !bg-dark-blue"
          onClick={handleSendTransactionButtonClick}
        >
          보내기
        </Button>
      </Box>
      <Toast isShow={isShow} severity="error" contents="전송에 실패했습니다." />
    </Box>
  );
}

export default EstimateTokenGas;