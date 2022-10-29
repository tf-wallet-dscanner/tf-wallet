import { useState } from 'react';
import { GrFormClose } from 'react-icons/gr';
import { useNavigate } from 'react-router-dom';
import Box from 'ui/components/atoms/box';
import Button from 'ui/components/atoms/button';
import Container from 'ui/components/atoms/container';
import TextField from 'ui/components/atoms/text-field';
import Tooltip from 'ui/components/atoms/tooltip';
import Typography from 'ui/components/atoms/typography';
import {
  useGetExportKeystoreV3,
  useGetExportPrivateKey,
  useGetStoreAccounts,
} from 'ui/data/account/account.hooks';
import { downloadFile } from 'ui/utils/util';

function ExportAccount() {
  const navigation = useNavigate();
  const [passwordForMnemonic, setPasswordForMnemonic] = useState('');
  const [passwordForJsonFile, setPasswordForJsonFile] = useState('');

  const { data: accounts } = useGetStoreAccounts();
  const selectedEOA = accounts?.identities?.find(
    ({ address }) => accounts?.selectedAddress === address,
  );

  // 비공개 추출
  const { data: exportPrivKey, refetch: refetchExportPrivKey } =
    useGetExportPrivateKey({
      address: selectedEOA?.address,
      password: passwordForJsonFile,
    });

  // 키스토어 파일 v3 다운로드
  const { refetch: makeKeystoreV3 } = useGetExportKeystoreV3(
    {
      privateKey: exportPrivKey,
      password: passwordForJsonFile,
    },
    {
      onSuccess(keystoreV3) {
        downloadFile(JSON.stringify(keystoreV3), 'keystoreV3.json');
      },
    },
  );

  const handleKeystoreV3FileDownload = async () => {
    await refetchExportPrivKey();
    await makeKeystoreV3();
  };

  return (
    <Container>
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
        <Button type="button" className="font-bold text-base !bg-dark-blue">
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
          onClick={handleKeystoreV3FileDownload}
        >
          다운로드
        </Button>
      </Box>
    </Container>
  );
}

export default ExportAccount;