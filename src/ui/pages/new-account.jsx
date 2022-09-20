import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';
import Card from 'ui/components/atoms/card';
import TextField from 'ui/components/atoms/text-field';
import { THEME_COLOR } from 'ui/constants/colors';
import {
  useGetMnemonicValidate,
  useGetNewMnemonic,
  useNewAccount,
} from 'ui/data/account/account.hooks';

function NewAccount() {
  const navigation = useNavigate();
  const [inputMnemonic, setInputMnemonic] = useState('');
  const [password, setPassword] = useState('');

  // 계정 생성 요청 (니모닉 코드 생성)
  const { data: mnemonicSeed, refetch: getNewMnemonicRefetch } =
    useGetNewMnemonic();

  // 니모닉 검증
  const { data: mnemonicValidate, refetch: getMnemonicValidateRefetch } =
    useGetMnemonicValidate({
      mnemonic: inputMnemonic,
    });

  // 계정 생성
  const { data: accountsData, mutate: newAccountMutate } = useNewAccount();

  const handleNewAccount = () => {
    newAccountMutate({
      mnemonic: mnemonicSeed,
      password,
    });
  };

  const onNextPage = () => {
    navigation('/');
  };

  return (
    <div style={{ padding: 16 }}>
      <Button className="mb-3" onClick={onNextPage}>
        Home
      </Button>

      <Button onClick={getNewMnemonicRefetch} color={THEME_COLOR.SUCCESS}>
        니모닉 생성
      </Button>
      {mnemonicSeed && (
        <Card className="mb-3" title="니모닉 코드" content={mnemonicSeed} />
      )}

      <textarea
        className="mt-2"
        id="newMnemonicInput"
        placeholder="니모닉 구문 입력"
        style={{ width: '100%' }}
        onChange={(e) => {
          setInputMnemonic(e.target.value);
        }}
      />
      <TextField
        password
        placeholder="비밀번호 입력"
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      <Button
        className="mb-1"
        onClick={getMnemonicValidateRefetch}
        color={THEME_COLOR.ERROR}
      >
        니모닉 검증
      </Button>
      <Button onClick={handleNewAccount} color={THEME_COLOR.WARNING}>
        계정 생성
      </Button>
      {mnemonicValidate && <Card title="니모닉 검증 결과" content="정상" />}
      {accountsData && <Card title="계정" content={accountsData[0]} />}
    </div>
  );
}

export default NewAccount;
