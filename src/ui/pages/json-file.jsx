import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';
import TextField from 'ui/components/atoms/text-field';
import { exportKeystoreV3 } from 'ui/data/account/account.api';
import { downloadFile } from 'ui/utils/util';

function JsonFile() {
  const [privateKey, setPrivateKey] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigate();

  const onNextPage = () => {
    navigation('/');
  };

  // 키스토어 파일 v3 다운로드
  const makeKeystoreV3 = useCallback(async () => {
    const keystoreV3 = await exportKeystoreV3({
      privateKey,
      password,
    });
    downloadFile(JSON.stringify(keystoreV3), 'keystoreV3.json');
  }, [privateKey, password]);

  return (
    <div style={{ padding: 16 }}>
      <Button onClick={onNextPage}>Home</Button>
      <br />

      <TextField
        password
        placeholder="개인키 입력"
        onChange={(e) => {
          setPrivateKey(e.target.value);
        }}
      />
      <TextField
        password
        placeholder="비밀번호 입력"
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      <Button onClick={makeKeystoreV3}>V3 JSON 다운로드</Button>
    </div>
  );
}

export default JsonFile;
