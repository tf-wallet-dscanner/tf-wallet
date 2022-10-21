import { SECOND } from 'app/constants/time';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useToggle } from 'react-use';
import Box from 'ui/components/atoms/box';
import Button from 'ui/components/atoms/button';
import Toast from 'ui/components/atoms/toast';
import {
  useGetMnemonicValidate,
  useImportAccount,
  useNewAccount,
} from 'ui/data/account/account.hooks';

function ConfirmMnemonic() {
  const navigation = useNavigate();
  const { password, mode } = useOutletContext();
  const [confirmMnemonic, setConfirmMnemonic] = useState('');
  const [isShow, toggle] = useToggle(false);
  // 니모닉 검증
  const { refetch: getMnemonicValidateRefetch } = useGetMnemonicValidate({
    mnemonic: confirmMnemonic,
  });
  // 계정 생성
  const { data: accountsData, mutate: newAccountMutate } = useNewAccount();
  // 계정 복구
  const { data: recoveryAccount, mutate: mutateRecoveryAccount } =
    useImportAccount();

  const handleValidation = (event) => {
    const { value } = event.target;
    setConfirmMnemonic(value.trim());
  };

  const handleMnemonicConfirm = () => {
    getMnemonicValidateRefetch().then(({ data: isMnemonicValid }) => {
      if (isMnemonicValid) {
        if (mode === 'create') {
          newAccountMutate({
            mnemonic: confirmMnemonic,
            password,
          });
        } else {
          mutateRecoveryAccount({
            mnemonic: confirmMnemonic,
            password,
          });
        }
      } else {
        toggle();
        setTimeout(toggle, SECOND);
      }
    });
  };

  useEffect(() => {
    if (!isEmpty(accountsData) || !isEmpty(recoveryAccount)) {
      navigation('/welcome-success');
    }
  }, [accountsData, recoveryAccount]);

  return (
    <Box as="article" className="confirm-mnemonic">
      <textarea
        className="w-full h-[150px] rounded-md mb-2"
        value={confirmMnemonic}
        onChange={handleValidation}
      />
      <Button
        type="button"
        className="font-bold text-base !bg-black mb-2"
        onClick={() => navigation(-1)}
      >
        뒤로가기
      </Button>
      <Button
        type="button"
        className="font-bold text-base !bg-dark-blue"
        onClick={handleMnemonicConfirm}
        disabled={isEmpty(confirmMnemonic)}
      >
        다음
      </Button>
      <Toast
        isShow={isShow}
        severity="error"
        contents="니모닉코드를 확인해주세요"
      />
    </Box>
  );
}

export default ConfirmMnemonic;
