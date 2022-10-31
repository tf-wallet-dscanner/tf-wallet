import { BAOBAB_SYMBOL } from 'app/constants/network';
import { SECOND } from 'app/constants/time';
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
import { useGetTokens } from 'ui/data/token';
import numberWithCommas from 'ui/utils/number-with-commas';

import './klay-transaction-item.scss';

/**
 * klaytn network 거래내역 조회 item
 * @param {hex string} hash
 * @param {hex string} from
 * @param {hex string} to
 * @param {hex string} gas
 * @param {hex string} gasUsed
 * @param {dec string} txFee
 * @param {hexstring} nonce
 * @param {dec string} amount - klay
 * @param {hex string} timestamp
 * @param {dec string} tokenValueToFormat
 * @returns {ReactElement}
 */
function KlayTransactionItem({
  hash,
  from,
  to,
  gas,
  gasUsed,
  txFee,
  nonce,
  amount: klay,
  timestamp,
  tokenValueToFormat,
  contract,
}) {
  const [{ value: copyText, error }, copyToClipboard] = useCopyToClipboard();
  const { currentChainId, selectedEOA } = useOutletContext();
  const { data: accountTokenList } = useGetTokens({
    currentChainId,
    selectedEOA,
  });
  const matchedToken = accountTokenList?.find(
    (token) => token.address === contract,
  );
  const tokenSymbol = matchedToken ? matchedToken.symbol : undefined;
  const [isShow, toggle] = useToggle(false);

  const isSend = selectedEOA?.address === from;
  const txItemName = isSend ? '보내기' : '받기';
  const localeDate = new Date(timestamp * 1000).toLocaleDateString();
  const balanceUnit = tokenSymbol ?? BAOBAB_SYMBOL;

  // token transfer일 경우 amount(klay)가 0
  const amount = parseFloat(klay) || parseFloat(tokenValueToFormat);
  const amountText = `${isSend ? '-' : ''}${amount} ${balanceUnit}`;
  const totalGasCharges = parseFloat(txFee);
  // token은 KLAY 단위로 사용하지 않기때문에 합계 계산에서 제외한다.
  const totalAmount = parseFloat(
    (parseFloat(klay) + totalGasCharges).toFixed(8),
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
    const bcExplorerDomainName = `https://explorer.dknote.net/txs/${hash}`;
    window.open(bcExplorerDomainName, '_blank').focus();
  };

  const copy = (text) => {
    copyToClipboard(text);
    toggle();
    setTimeout(toggle, SECOND);
  };

  return (
    <>
      <Box as="label" htmlFor={`klay-transaction-item__modal-${hash}`}>
        <Box as="li" className="klay-transaction-item">
          <Box className="klay-transaction-item__wrapper">
            <Box className="klay-transaction-item__wrapper-icon">
              {isSend ? (
                <MdOutlineCallMade className="text-xl text-[#f0df4f]" />
              ) : (
                <MdOutlineCallReceived className="text-xl text-[#f0df4f]" />
              )}
            </Box>
            <Box className="klay-transaction-item__wrapper-info">
              <Box className="klay-transaction-item__wrapper-info__type">
                <Typography as="strong">{txItemName}</Typography>
              </Box>
              <Box className="klay-transaction-item__wrapper-info__receipt">
                <Typography className="klay-transaction-item__wrapper-info__receipt-timestamp">
                  {`${localeDate} `}
                </Typography>
                <Box as="br" />
                <Typography className="klay-transaction-item__wrapper-info-receipt-address">
                  {isSend ? '수신' : '발신'}: {getEllipsisAddress(to)}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box className="klay-transaction-item__amount">
            <Typography as="strong">{amountText}</Typography>
          </Box>
        </Box>
      </Box>
      <input
        type="checkbox"
        id={`klay-transaction-item__modal-${hash}`}
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
              htmlFor={`klay-transaction-item__modal-${hash}`}
            >
              <GrFormClose className="text-2xl cursor-pointer" />
            </Typography>
          </Box>
          <Box className="mb-4" />
          <Box as="section" className="klay-transaction-item__modal-contents">
            <Box className="klay-transaction-item__modal-contents__box">
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
            <Box className="klay-transaction-item__modal-contents__box">
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
            <Box className="klay-transaction-item__modal-contents__box">
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
                    className="klay-transaction-item__modal-contents__box__clipboard-text"
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
                    className="klay-transaction-item__modal-contents__box__clipboard-text"
                    onClick={() => copy(to)}
                  >
                    {getEllipsisAddress(to)}
                  </Typography>
                </Tooltip>
              </Box>
            </Box>
            <Box className="klay-transaction-item__modal-contents__box">
              <Typography as="strong" className="text-sm">
                거래
              </Typography>
              <Typography />
            </Box>
            <Box className="klay-transaction-item__modal-contents__box">
              <Typography>임시값</Typography>
              <Typography>{numberWithCommas(parseInt(nonce, 16))}</Typography>
            </Box>
            <Box className="klay-transaction-item__modal-contents__box">
              <Typography>금액</Typography>
              <Typography as="strong">{amountText}</Typography>
            </Box>
            <Box className="klay-transaction-item__modal-contents__box">
              <Typography>가스 한도</Typography>
              <Typography>{numberWithCommas(parseInt(gas, 16))}</Typography>
            </Box>
            <Box className="klay-transaction-item__modal-contents__box">
              <Typography>사용한 가스</Typography>
              <Typography>{numberWithCommas(parseInt(gasUsed, 16))}</Typography>
            </Box>
            <Box className="klay-transaction-item__modal-contents__box">
              <Typography>총 가스 요금</Typography>
              <Typography>
                {totalGasCharges} {BAOBAB_SYMBOL}
              </Typography>
            </Box>
            <Box className="klay-transaction-item__modal-contents__box">
              <Typography>합계</Typography>
              <Typography as="strong">
                {totalAmount} {BAOBAB_SYMBOL}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default memo(KlayTransactionItem);
