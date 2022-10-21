import { SECOND } from 'app/constants/time';
import { useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useCopyToClipboard, useToggle } from 'react-use';
import Alert from 'ui/components/atoms/alert';
import Box from 'ui/components/atoms/box';
import Button from 'ui/components/atoms/button';
import Toast from 'ui/components/atoms/toast';
import { useGetNewMnemonic } from 'ui/data/account/account.hooks';

function CreateMnemonic() {
  const navigation = useNavigate();
  const { mnemonic, setMnemonic } = useOutletContext();
  const [isShow, toggle] = useToggle(false);
  const [{ value, error }, copyToClipboard] = useCopyToClipboard();
  // 계정 생성 요청 (니모닉 코드 생성)
  const { refetch: getNewMnemonicRefetch } = useGetNewMnemonic();

  const copyMnemonic = () => {
    copyToClipboard(mnemonic);
    toggle();
    setTimeout(toggle, SECOND);
  };

  useEffect(() => {
    if (mnemonic === '') {
      getNewMnemonicRefetch().then(({ data }) => {
        setMnemonic(data);
      });
    }
  }, [mnemonic]);

  return (
    <Box as="article" className="create-mnemonic">
      <Alert
        className="mb-2"
        severity="warning"
        contents="아래 텍스트 박스를 클릭하시면 니모닉코드가 복사됩니다."
      />
      <textarea
        className="w-full h-[150px] rounded-md cursor-copy mb-2"
        value={mnemonic}
        onClick={copyMnemonic}
        readOnly
      />
      {value && (
        <Toast isShow={isShow} severity="success" contents="copied!!" />
      )}
      {error && (
        <Toast
          isShow={isShow}
          severity="error"
          contents="Unable to copy value!"
        />
      )}
      <Button
        type="button"
        className="font-bold text-base !bg-dark-blue"
        onClick={() => navigation('/confirm-mnemonic')}
      >
        다음
      </Button>
    </Box>
  );
}

export default CreateMnemonic;
