import {
  BAOBAB_CHAIN_ID,
  CYPRESS_CHAIN_ID,
  GOERLI_CHAIN_ID,
  MAINNET_CHAIN_ID,
} from 'app/constants/network';
import { SECOND } from 'app/constants/time';
import { useEffect, useState } from 'react';
import { GrFormClose } from 'react-icons/gr';
import { useNavigate } from 'react-router-dom';
import { useCopyToClipboard, useToggle } from 'react-use';
import Box from 'ui/components/atoms/box';
import Button from 'ui/components/atoms/button';
import Container from 'ui/components/atoms/container';
import Loading from 'ui/components/atoms/loading';
import TextField from 'ui/components/atoms/text-field';
import Toast from 'ui/components/atoms/toast';
import Tooltip from 'ui/components/atoms/tooltip';
import Typography from 'ui/components/atoms/typography';
import {
  useGetExportKeystoreV3,
  useGetExportKeystoreV4,
  useGetExportPrivateKey,
  useGetMnemonicFromVault,
  useGetStoreAccounts,
} from 'ui/data/account/account.hooks';
import { useGetCurrentChainId } from 'ui/data/provider';
import { downloadFile } from 'ui/utils/util';

function ExportAccount() {
  const { data: currentChainId } = useGetCurrentChainId();
  const isEthereumNetwork =
    currentChainId === MAINNET_CHAIN_ID || currentChainId === GOERLI_CHAIN_ID;
  const isKlaytnNetwork =
    currentChainId === CYPRESS_CHAIN_ID || currentChainId === BAOBAB_CHAIN_ID;

  const navigation = useNavigate();
  const [passwordForMnemonic, setPasswordForMnemonic] = useState('');
  const [passwordForJsonFile, setPasswordForJsonFile] = useState('');
  const [isShow, toggle] = useToggle(false);
  const [{ value: copiedText, error }, copyToClipboard] = useCopyToClipboard();

  const { data: accounts } = useGetStoreAccounts();
  const {
    data,
    isLoading,
    refetch: makeMnemonic,
  } = useGetMnemonicFromVault({
    password: passwordForMnemonic,
  });
  const selectedEOA = accounts?.identities?.find(
    ({ address }) => accounts?.selectedAddress === address,
  );

  // 비공개 추출
  const {
    data: exportPrivKey,
    isError: isGetExportPrivateKeyError,
    refetch: refetchExportPrivKey,
  } = useGetExportPrivateKey(
    {
      address: selectedEOA?.address,
      password: passwordForJsonFile,
    },
    {
      onError() {
        toggle();
        setTimeout(toggle, SECOND);
      },
    },
  );

  // 키스토어 파일 v3 다운로드
  const {
    isLoading: isDownloadingV3,
    isError: isGetExportKeystoreV3Error,
    refetch: makeKeystoreV3,
  } = useGetExportKeystoreV3(
    {
      privateKey: exportPrivKey,
      password: passwordForJsonFile,
    },
    {
      onSuccess(keystoreV3) {
        downloadFile(JSON.stringify(keystoreV3), 'keystoreV3.json');
      },
      onError() {
        toggle();
        setTimeout(toggle, SECOND);
      },
    },
  );

  // 키스토어 파일 v4 다운로드
  const {
    isLoading: isDownloadingV4,
    isError: isGetExportKeystoreV4Error,
    refetch: makeKeystoreV4,
  } = useGetExportKeystoreV4(
    {
      address: selectedEOA?.address,
      privateKey: exportPrivKey,
      password: passwordForJsonFile,
    },
    {
      onSuccess(keystoreV4) {
        downloadFile(JSON.stringify(keystoreV4), 'keystoreV4.json');
      },
      onError() {
        toggle();
        setTimeout(toggle, SECOND);
      },
    },
  );

  const copyMnemonic = () => {
    copyToClipboard(data?.mnemonic);
    toggle();
    setTimeout(toggle, SECOND);
  };

  const handleExportMnemonicCode = async () => {
    makeMnemonic();
  };

  const handleKeystoreFileDownload = async () => {
    refetchExportPrivKey();
  };

  useEffect(() => {
    if (exportPrivKey) {
      if (isEthereumNetwork) makeKeystoreV3();
      else if (isKlaytnNetwork) makeKeystoreV4();
    }
  }, [exportPrivKey, makeKeystoreV3, makeKeystoreV4]);

  return (
    <Container>
      {isLoading && <Loading />}
      {isDownloadingV3 || (isDownloadingV4 && <Loading />)}
      {copiedText && (
        <Toast isShow={isShow} severity="success" contents="copied!!" />
      )}
      {error && (
        <Toast
          isShow={isShow}
          severity="error"
          contents="Unable to copy value!"
        />
      )}
      {isGetExportPrivateKeyError && (
        <Toast
          isShow={isShow}
          severity="error"
          contents="패스워드를 확인해주세요!"
        />
      )}
      {isGetExportKeystoreV3Error && (
        <Toast
          isShow={isShow}
          severity="error"
          contents="keystoreV3.json 다운로드에 실패했습니다!"
        />
      )}
      {isGetExportKeystoreV4Error && (
        <Toast
          isShow={isShow}
          severity="error"
          contents="keystoreV4.json 다운로드에 실패했습니다!"
        />
      )}
      <Box className="fixed top-0 right-0 p-2" onClick={() => navigation(-1)}>
        <GrFormClose className="cursor-pointer svg-white text-32" />
      </Box>
      <Box className="mt-4">
        <Typography as="h1" className="pb-4 text-xl">
          내부 Mnemonic 문구 불러오기
        </Typography>
        <TextField
          password
          className="mb-3 bg-white"
          placeholder="패스워드 입력"
          value={passwordForMnemonic}
          onChange={(event) => setPasswordForMnemonic(event.target.value)}
        />
        {data?.mnemonic && (
          <textarea
            className="w-full h-[100px] rounded-md mb-2 cursor-copy"
            value={data?.mnemonic}
            onClick={copyMnemonic}
            readOnly
          />
        )}
        <Button
          type="button"
          className="font-bold text-base !bg-dark-blue"
          onClick={handleExportMnemonicCode}
        >
          불러오기
        </Button>
      </Box>
      <Box as="hr" className="my-4" />
      <Box>
        <Typography as="h1" className="text-xl">
          Keystore Download
        </Typography>
        <Box className="py-4 text-center">
          <Typography as="h1" className="text-base">
            {selectedEOA?.name ?? '0x0'}
          </Typography>
          <Tooltip className="mx-auto" message={selectedEOA?.address ?? '0x0'}>
            <Typography as="h1">{selectedEOA?.address ?? '0x0'}</Typography>
          </Tooltip>
        </Box>
        <TextField
          password
          className="mb-3 bg-white"
          value={passwordForJsonFile}
          placeholder="패스워드 입력"
          onChange={(event) => setPasswordForJsonFile(event.target.value)}
        />
        <Button
          type="button"
          className="font-bold text-base !bg-dark-blue"
          onClick={handleKeystoreFileDownload}
        >
          다운로드
        </Button>
      </Box>
    </Container>
  );
}

export default ExportAccount;
