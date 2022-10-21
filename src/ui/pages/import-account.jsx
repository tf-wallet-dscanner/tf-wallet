import { useEffect, useState } from 'react';
import { GrFormClose } from 'react-icons/gr';
import { useNavigate } from 'react-router-dom';
import FileInput from 'react-simple-file-input';
import Box from 'ui/components/atoms/box';
import Button from 'ui/components/atoms/button';
import Container from 'ui/components/atoms/container';
import TextField from 'ui/components/atoms/text-field';
import Typography from 'ui/components/atoms/typography';
import {
  useAddAccounts,
  useGetImportAccountStrategy,
} from 'ui/data/account/account.hooks';

function NewAccount() {
  const navigation = useNavigate();
  const [importPrivKey, setImportPrivKey] = useState(''); // 비공개키 type일 때 비공개키 정보
  const [importFileInput, setImportFileInput] = useState(''); // json file type일 때 file 정보
  const [importFileName, setImportFileName] = useState(''); // json file type일 때 file 정보
  const [importPassword, setImportPassword] = useState(''); // import 시 필요한 password 정보

  const handleFileChange = (event) => {
    setImportFileName(event.name);
  };

  const { mutate: addAccounts } = useAddAccounts({
    onSuccess() {
      navigation(-1);
    },
  });
  /**
   * import 타입에 따른 계정 가져오기
   * @param {string} strategy - import 유형 (Private Key, JSON File)
   * @param {object} args - { password: 비밀번호, privateKey || fileContents: 타입에 따라 비공개 키 or JSON File }
   * @returns {string} selectedAddress - 주소값
   */
  const {
    data: newAddressByPrivateKey,
    refetch: refetchImportStrategyByPrivateKey,
  } = useGetImportAccountStrategy({
    strategy: 'Private Key',
    args: {
      privateKey: importPrivKey,
    },
  });

  const {
    data: newAddressByKeystoreFile,
    refetch: refetchImportStrategyByKeystoreFile,
  } = useGetImportAccountStrategy({
    strategy: 'JSON File',
    args: {
      password: importPassword,
      fileContents: importFileInput,
    },
  });

  useEffect(() => {
    if (newAddressByPrivateKey || newAddressByKeystoreFile) {
      navigation(-1);
    }
  }, [newAddressByPrivateKey, newAddressByKeystoreFile]);

  return (
    <Container className="import-account">
      <Box className="fixed top-0 right-0 p-2" onClick={() => navigation(-1)}>
        <GrFormClose className="cursor-pointer svg-white text-32" />
      </Box>
      <Box className="mt-6 mb-2">
        <Button
          type="button"
          className="font-bold text-base !bg-dark-blue"
          onClick={addAccounts}
        >
          계정 추가
        </Button>
      </Box>
      <Box as="hr" className="my-4" />
      <Box>
        <Typography as="h1" className="pb-4 text-xl">
          외부 계정 import
        </Typography>
        <TextField
          password
          className="mb-3 bg-white"
          placeholder="Private Key 입력"
          onChange={(e) => {
            setImportPrivKey(e.target.value);
          }}
        />
        <Button
          type="button"
          className="font-bold text-base !bg-dark-blue"
          onClick={refetchImportStrategyByPrivateKey}
        >
          계정 추가
        </Button>
      </Box>
      <Box className="py-8" />
      <Box>
        <Typography
          as="label"
          className="w-3/5 cursor-pointer btn"
          htmlFor="import-account__file-uploader"
        >
          Keystore 파일 선택
        </Typography>
        <Typography className="w-2/5 ml-2 text-shorten">
          {importFileName}
        </Typography>
        <FileInput
          id="import-account__file-uploader"
          className="invisible"
          readAs="text"
          onLoad={(event) => setImportFileInput(event.target.result)}
          onChange={handleFileChange}
        />
        <TextField
          password
          className="mb-4 bg-white"
          placeholder="Keystore 비밀번호 입력"
          onChange={(e) => {
            setImportPassword(e.target.value);
          }}
        />
        <Button
          type="button"
          className="font-bold text-base !bg-dark-blue"
          onClick={refetchImportStrategyByKeystoreFile}
        >
          계정 추가
        </Button>
      </Box>
    </Container>
  );
}

export default NewAccount;
