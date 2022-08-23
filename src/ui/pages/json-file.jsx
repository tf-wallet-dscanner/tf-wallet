import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileInput from 'react-simple-file-input';
import Button from 'ui/components/atoms/button';
import TextField from 'ui/components/atoms/text-field';
import {
  exportKeystoreV3,
  importAccountStrategy,
} from 'ui/data/account/account.api';
import { downloadFile } from 'ui/utils/util';

function JsonFile() {
  // keystore json v3 export시 필요한 정보(비공개키, 패스워드)
  const [privateKey, setPrivateKey] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigate();

  // import할 2가지 타입
  const importTypeList = [
    { type: 'Private Key', name: '비공개 키' },
    { type: 'JSON File', name: 'JSON 파일' },
  ];

  const [currentType, setCurrentType] = useState('Private Key'); // import type
  const [importPrivKey, setImportPrivKey] = useState(''); // 비공개키 type일 때 비공개키 정보
  const [importFileInput, setImportFileInput] = useState(''); // json file type일 때 file 정보
  const [importPassword, setImportPassword] = useState(''); // import 시 필요한 password 정보
  const [selectedAddress, setSelectedAddress] = useState(''); // 계정 가져오기를 통해 controller에서 전달받은 address 정보

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

  const handleTypeChange = (event) => {
    const { value: importType } = event.target;
    setCurrentType(importType);
  };

  /**
   *  file input 이벤트
   *  keystore v3 json file의 경우 event.target.result JSON string 형태
   */
  const onLoad = (event) => {
    setImportFileInput(event.target.result);
  };

  /**
   * 계정 가져오기
   * @param {string} strategy - import 유형 (Private Key, JSON File)
   * @param {object} args - { password: 비밀번호, privateKey || fileContents: 타입에 따라 비공개 키 or JSON File }
   */
  const importAccount = useCallback(async () => {
    const resAddress = await importAccountStrategy({
      strategy: currentType,
      args: {
        password: importPassword,
        ...(currentType === 'Private Key'
          ? { privateKey: importPrivKey }
          : { fileContents: importFileInput }),
      },
    });
    console.log('resAddress => ', resAddress);
    setSelectedAddress(resAddress);
  }, [importPrivKey, importPassword, currentType, importFileInput]);

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
      <Button onClick={makeKeystoreV3} className="mb-20">
        V3 JSON 다운로드
      </Button>

      <div>계정 가져오기 : {selectedAddress}</div>
      <select name="importType" onChange={handleTypeChange} value={currentType}>
        {importTypeList.map(({ type, name }, index) => (
          <option key={index} value={type}>
            {name}
          </option>
        ))}
      </select>

      {currentType === 'Private Key' && (
        <>
          <TextField
            placeholder="비공개 키 문자열을 넣으세요"
            onChange={(e) => {
              setImportPrivKey(e.target.value);
            }}
          />
          <TextField
            password
            placeholder="비밀번호 입력"
            onChange={(e) => {
              setImportPassword(e.target.value);
            }}
          />
        </>
      )}
      {currentType === 'JSON File' && (
        <>
          <FileInput
            readAs="text"
            onLoad={onLoad}
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
            placeholder="비밀번호 입력"
            onChange={(e) => {
              setImportPassword(e.target.value);
            }}
          />
        </>
      )}
      <Button onClick={importAccount} className="mb-20">
        가져오기
      </Button>
    </div>
  );
}

export default JsonFile;
