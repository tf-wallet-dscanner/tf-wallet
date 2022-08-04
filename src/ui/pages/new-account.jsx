import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';
import TextField from 'ui/components/atoms/text-field';
import {
  generateMnemonic,
  newAccount,
  validateMnemonic,
} from 'ui/data/account/account.api';

function NewAccount() {
  const [password, setPassword] = useState('');
  const [mnemonicSeed, setMnemonicSeed] = useState('');
  const [mnemonicValidate, setMnemonicValidate] = useState(false);
  const [accountsData, setAccountsData] = useState([]);
  const navigation = useNavigate();

  const onNextPage = () => {
    navigation('/');
  };

  // 계정 생성 요청 (니모닉 코드 생성)
  const requestGenerateMnemonic = async () => {
    const mnemonic = await generateMnemonic();
    setMnemonicSeed(mnemonic);
  };

  // 니모닉 검증
  const requestValidateMnemonic = async () => {
    const validate = await validateMnemonic(
      document.getElementById('newMnemonicInput').value,
    );
    setMnemonicValidate(validate);
  };

  // 계정 생성
  const requestNewAccount = useCallback(async () => {
    const accounts = await newAccount({
      mnemonic: mnemonicSeed,
      password,
    });
    setAccountsData(accounts);
  }, [mnemonicSeed, password]);

  return (
    <div style={{ padding: 16 }}>
      <Button onClick={onNextPage}>Home</Button>
      <br />

      <Button onClick={requestGenerateMnemonic}>니모닉 생성</Button>
      <div>니모닉 코드 : {mnemonicSeed}</div>
      <br />

      <textarea id="newMnemonicInput" style={{ width: '100%' }} />
      <Button onClick={requestValidateMnemonic}>니모닉 검증</Button>
      <div>니모닉 검증 결과 : {mnemonicValidate ? '정상' : ''}</div>
      <br />

      <TextField
        password
        placeholder="비밀번호 입력"
        model={password}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      <Button onClick={requestNewAccount}>계정 생성</Button>
      <div>계정 : {JSON.stringify(accountsData)}</div>
    </div>
  );
}

export default NewAccount;
