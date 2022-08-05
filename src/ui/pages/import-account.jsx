import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';
import TextField from 'ui/components/atoms/text-field';
import {
  exportPrivateKey,
  exportPublicKey,
  importAccount,
} from 'ui/data/account/account.api';

function NewAccount() {
  const [password, setPassword] = useState('');
  const [accountsData, setAccountsData] = useState([]);
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const navigation = useNavigate();

  const onNextPage = () => {
    navigation('/');
  };

  // 계정 복구
  const requestImportAccount = useCallback(async () => {
    if (!password.length) alert('패스워드를 입력하세요');
    const accounts = await importAccount({
      mnemonic: document.getElementById('importMnemonicInput').value,
      password,
    });
    setAccountsData(accounts);
  }, [password]);

  // 비공개키 추출
  const requestExportPrivateKey = useCallback(async () => {
    const privKey = await exportPrivateKey({
      address: document.getElementById('address_text').value,
      password,
    });
    setPrivateKey(privKey);
  }, [password]);

  // 공개키 추출
  const requestExportPublicKey = useCallback(async () => {
    const pubKey = await exportPublicKey({
      address: document.getElementById('address_text').value,
      password,
    });
    setPublicKey(pubKey);
  }, [password]);

  return (
    <div style={{ padding: 16 }}>
      <Button onClick={onNextPage}>Home</Button>
      <br />

      <div>니모닉 코드</div>
      <textarea id="importMnemonicInput" style={{ width: '100%' }} />
      <TextField
        password
        placeholder="새 비밀번호 입력"
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      <Button onClick={requestImportAccount}>계정 복구</Button>
      <div>복구 계정 : {JSON.stringify(accountsData)}</div>

      <br />
      <TextField placeholder="주소값 입력" id="address_text" />
      <Button onClick={requestExportPrivateKey}>privateKey 추출</Button>
      <div className="break-words">비공개키 : {privateKey}</div>

      <br />
      <Button onClick={requestExportPublicKey}>publicKey 추출</Button>
      <div className="break-words">공개키 : {publicKey}</div>
    </div>
  );
}

export default NewAccount;
