import {
  ETH_SYMBOL,
  GOERLI,
  GOERLI_CHAIN_ID,
  MAINNET_CHAIN_ID,
  TEST_NETWORK_TICKER_MAP,
} from 'app/constants/network';
import { SECOND } from 'app/constants/time';
import { weiHexToEthDec } from 'app/lib/util';
import { memo } from 'react';
import { FiArrowRightCircle } from 'react-icons/fi';
import { GrFormClose } from 'react-icons/gr';
import { MdOutlineCallMade, MdOutlineCallReceived } from 'react-icons/md';
import { useOutletContext } from 'react-router-dom';
import { useCopyToClipboard, useToggle } from 'react-use';
import Avatar from 'ui/components/atoms/avatar';
import Box from 'ui/components/atoms/box';
import Toast from 'ui/components/atoms/toast';
import Tooltip from 'ui/components/atoms/tooltip';
import Typography from 'ui/components/atoms/typography';
import numberWithCommas from 'ui/utils/number-with-commas';

import './eth-transaction-item.scss';

const balanceUnitMap = {
  [MAINNET_CHAIN_ID]: ETH_SYMBOL,
  [GOERLI_CHAIN_ID]: TEST_NETWORK_TICKER_MAP[GOERLI],
};

/**
 * ethereum network 거래내역 조회 item
 * @param {hex string} transaction.hash
 * @param {hexstring} transaction.from
 * @param {hex string} transaction.to
 * @param {dec string} transaction.nonce
 * @param {dec string} transaction.value
 * @param {dec string} transaction.gas
 * @param {dec string} transaction.gasUsed
 * @param {dec string} transaction.gasPrice
 * @param {dec string} transaction.timeStamp
 * @param {string} transaction.tokenSymbol
 * @returns {ReactElement}
 */
function EthTransactionItem({
  hash,
  from,
  to,
  nonce,
  value = Number(0),
  gas,
  gasUsed,
  gasPrice,
  timeStamp,
  tokenSymbol,
}) {
  const [{ value: copyText, error }, copyToClipboard] = useCopyToClipboard();
  const { currentChainId, selectedEOA } = useOutletContext();
  const [isShow, toggle] = useToggle(false);

  const isSend = selectedEOA?.address === from;
  const txItemName = `${tokenSymbol ?? ''}${tokenSymbol ? ' ' : ''}${
    isSend ? '보내기' : '받기'
  }`;
  const localeDate = new Date(timeStamp * 1000).toLocaleDateString();
  const balanceUnit = tokenSymbol ?? balanceUnitMap[currentChainId] ?? '';
  const amount = `${isSend ? '-' : ''}${weiHexToEthDec(
    value.toString(16),
  )} ${balanceUnit}`;
  const totalGasCharges = parseFloat((gasUsed * gasPrice) / 10 ** 18);
  const totalAmount = parseFloat(
    (parseFloat(weiHexToEthDec(value.toString(16))) + totalGasCharges).toFixed(
      8,
    ),
  );

  const getEllipsisAddress = (address) => {
    if (address) {
      const prefix = address.slice(0, 5);
      const suffix = address.slice(-4);
      return `${prefix}...${suffix}`;
    }
    return '0x0';
  };

  const openEtherscan = () => {
    const etherscanDomainName =
      currentChainId === GOERLI_CHAIN_ID
        ? `https://goerli.etherscan.io/tx/${hash}`
        : `https://etherscan.io/tx/${hash}`;
    window.open(etherscanDomainName, '_blank').focus();
  };

  const copy = (text) => {
    copyToClipboard(text);
    toggle();
    setTimeout(toggle, SECOND);
  };

  return (
    <>
      <Box as="label" htmlFor={`eth-transaction-item__modal-${hash}`}>
        <Box as="li" className="eth-transaction-item">
          <Box className="eth-transaction-item__wrapper">
            <Box className="eth-transaction-item__wrapper-icon">
              {isSend ? (
                <MdOutlineCallMade className="text-xl text-[#f0df4f]" />
              ) : (
                <MdOutlineCallReceived className="text-xl text-[#f0df4f]" />
              )}
            </Box>
            <Box className="eth-transaction-item__wrapper-info">
              <Box className="eth-transaction-item__wrapper-info__type">
                <Typography as="strong">{txItemName}</Typography>
              </Box>
              <Box className="eth-transaction-item__wrapper-info__receipt">
                <Typography className="eth-transaction-item__wrapper-info__receipt-timestamp">
                  {`${localeDate} `}
                </Typography>
                <Box as="br" />
                <Typography className="eth-transaction-item__wrapper-info-receipt-address">
                  {isSend ? '수신' : '발신'}: {getEllipsisAddress(to)}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box className="eth-transaction-item__amount">
            <Typography as="strong">{amount}</Typography>
          </Box>
        </Box>
      </Box>
      <input
        type="checkbox"
        id={`eth-transaction-item__modal-${hash}`}
        className="modal-toggle"
      />
      <Box className="modal">
        <Box className="modal-box">
          <Box className="flex justify-between">
            <Typography
              as="h3"
              className="font-bold text-base text-left !text-black"
            >
              {txItemName}
            </Typography>
            <Typography
              as="label"
              htmlFor={`eth-transaction-item__modal-${hash}`}
            >
              <GrFormClose className="text-2xl cursor-pointer" />
            </Typography>
          </Box>
          <Box className="mb-4" />
          <Box as="section" className="eth-transaction-item__modal-contents">
            <Box className="eth-transaction-item__modal-contents__box">
              <Typography as="strong" className="text-sm">
                상태
              </Typography>
              <Typography
                className="!text-blue-500 text-2xs cursor-pointer"
                onClick={openEtherscan}
              >
                블록 탐색기에서 보기
              </Typography>
            </Box>
            <Box className="eth-transaction-item__modal-contents__box">
              <Typography className="!text-[#28a745] text-2xs">
                확인됨
              </Typography>
              <Typography
                className="!text-blue-500 text-2xs cursor-pointer"
                onClick={() => copy(hash)}
              >
                거래 ID 복사
              </Typography>
            </Box>
            {copyText && (
              <Toast isShow={isShow} severity="success" contents="복사완료!" />
            )}
            {error && (
              <Toast
                isShow={isShow}
                severity="error"
                contents="Unable to copy value!"
              />
            )}
            <Box className="eth-transaction-item__modal-contents__box">
              <Typography as="strong" className="text-sm">
                발신
              </Typography>
              <Typography as="strong" className="text-sm">
                수신
              </Typography>
            </Box>
            <Box className="flex p-1">
              <Box className="flex items-center">
                <Avatar imgUrl="https://placeimg.com/192/192/people" />
                <Tooltip message="주소를 클립보드에 복사">
                  <Typography
                    as="strong"
                    className="eth-transaction-item__modal-contents__box__clipboard-text"
                    onClick={() => copy(from)}
                  >
                    {getEllipsisAddress(from)}
                  </Typography>
                </Tooltip>
              </Box>
              <Box className="flex items-center px-3">
                <FiArrowRightCircle className="text-2xl" />
              </Box>
              <Box className="flex items-center">
                <Avatar imgUrl="https://placeimg.com/192/192/people" />
                <Tooltip message="주소를 클립보드에 복사">
                  <Typography
                    as="strong"
                    className="eth-transaction-item__modal-contents__box__clipboard-text"
                    onClick={() => copy(to)}
                  >
                    {getEllipsisAddress(to)}
                  </Typography>
                </Tooltip>
              </Box>
            </Box>
            <Box className="eth-transaction-item__modal-contents__box">
              <Typography as="strong" className="text-sm">
                거래
              </Typography>
              <Typography />
            </Box>
            <Box className="eth-transaction-item__modal-contents__box">
              <Typography>임시값</Typography>
              <Typography>{numberWithCommas(nonce)}</Typography>
            </Box>
            <Box className="eth-transaction-item__modal-contents__box">
              <Typography>금액</Typography>
              <Typography as="strong">{amount}</Typography>
            </Box>
            <Box className="eth-transaction-item__modal-contents__box">
              <Typography>가스 한도</Typography>
              <Typography>{numberWithCommas(gas)}</Typography>
            </Box>
            <Box className="eth-transaction-item__modal-contents__box">
              <Typography>사용한 가스</Typography>
              <Typography>{numberWithCommas(gasUsed)}</Typography>
            </Box>
            <Box className="eth-transaction-item__modal-contents__box">
              <Typography>총 가스 요금</Typography>
              <Typography>
                {parseFloat(totalGasCharges.toFixed(6))}{' '}
                {balanceUnitMap[currentChainId]}
              </Typography>
            </Box>
            <Box className="eth-transaction-item__modal-contents__box">
              <Typography>합계</Typography>
              <Typography as="strong">
                {totalAmount} {balanceUnitMap[currentChainId]}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default memo(EthTransactionItem);
