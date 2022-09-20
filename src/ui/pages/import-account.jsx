import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileInput from 'react-simple-file-input';
import Button from 'ui/components/atoms/button';
import Card from 'ui/components/atoms/card';
import TextField from 'ui/components/atoms/text-field';
import { THEME_COLOR } from 'ui/constants/colors';
import {
  useGetExportPrivateKey,
  useGetExportPublicKey,
  useGetKeystoreToPrivKey,
  useImportAccount,
} from 'ui/data/account/account.hooks';

function NewAccount() {
  const navigation = useNavigate();
  const [recoverySeed, setRecoverySeed] = useState(''); // 복구 구문 textarae
  const [recoveryPassword, setRecoveryPassword] = useState(''); // 복구 재설정 패스워드

  const [addressToPrivPub, setAddressToPrivPub] = useState(''); // 비공개/공개키 추출위한 address
  const [passwordToPrivPub, setPasswordToPrivPub] = useState(''); // 비공개/공개키 추출위한 패스워드

  const [keystoreInput, setKeystoreInput] = useState(''); // keystore file 정보
  const [keystorePassword, setKeystorePassword] = useState(''); // keystore file 패스워드

  // 계정 복구
  const { data: recoveryAccount, mutate: mutateRecoveryAccount } =
    useImportAccount();

  // 비공개 추출
  const { data: exportPrivKey, refetch: refetchExportPrivKey } =
    useGetExportPrivateKey({
      address: addressToPrivPub,
      password: passwordToPrivPub,
    });

  // 공개키 추출
  const { data: exportPubKey, refetch: refetchExportPubKey } =
    useGetExportPublicKey({
      address: addressToPrivPub,
      password: passwordToPrivPub,
    });

  // keystore.json(V3) -> privateKey 추출
  const { data: keystoreToPrivKey, refetch: refetchKeystoreToPrivKey } =
    useGetKeystoreToPrivKey({
      fileContents: keystoreInput,
      password: keystorePassword,
    });

  const handleRecoveryAccount = () => {
    mutateRecoveryAccount({
      mnemonic: recoverySeed,
      password: recoveryPassword,
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

      <textarea
        id="importMnemonicInput"
        style={{ width: '100%' }}
        placeholder="니모닉 구문 입력"
        onChange={(e) => {
          setRecoverySeed(e.target.value);
        }}
      />
      <TextField
        password
        placeholder="새 비밀번호 입력"
        onChange={(e) => {
          setRecoveryPassword(e.target.value);
        }}
      />
      <Button onClick={handleRecoveryAccount} color={THEME_COLOR.SUCCESS}>
        계정 복구
      </Button>
      {recoveryAccount && (
        <Card title="복구 계정" content={recoveryAccount[0]} />
      )}

      <Card title="Address로 비공개/공개키 추출" />
      <TextField
        placeholder="주소값 입력"
        onChange={(e) => {
          setAddressToPrivPub(e.target.value);
        }}
      />
      <TextField
        password
        placeholder="비밀번호 입력"
        onChange={(e) => {
          setPasswordToPrivPub(e.target.value);
        }}
      />
      <Button
        className="mb-1"
        onClick={refetchExportPrivKey}
        color={THEME_COLOR.INFO}
      >
        비공개키 추출
      </Button>
      <Button onClick={refetchExportPubKey} color={THEME_COLOR.WARNING}>
        공개키 추출
      </Button>
      {exportPrivKey && <Card title="비공개키" content={exportPrivKey} />}
      {exportPubKey && <Card title="공개키" content={exportPubKey} />}

      <Card title="keystore.json(V3) -> 비공개키 추출" />
      <FileInput
        readAs="text"
        onLoad={(event) => setKeystoreInput(event.target.result)}
        style={{
          padding: '20px 0px 12px 15%',
          fontSize: '15px',
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
        }}
      />
      <TextField
        password
        placeholder="keystore 비밀번호 입력"
        onChange={(e) => {
          setKeystorePassword(e.target.value);
        }}
      />
      <Button
        className="mb-1"
        onClick={refetchKeystoreToPrivKey}
        color={THEME_COLOR.INFO}
      >
        비공개키 추출
      </Button>
      {keystoreToPrivKey && (
        <Card title="비공개키" content={keystoreToPrivKey.privKey} />
      )}
    </div>
  );
}

export default NewAccount;
