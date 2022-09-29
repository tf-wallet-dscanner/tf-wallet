import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileInput from 'react-simple-file-input';
import Button from 'ui/components/atoms/button';
import Card from 'ui/components/atoms/card';
import TextField from 'ui/components/atoms/text-field';
import { THEME_COLOR } from 'ui/constants/colors';
import {
  useGetExportKeystoreV3,
  useGetImportAccountStrategy,
} from 'ui/data/account/account.hooks';
import { downloadFile } from 'ui/utils/util';

function JsonFile() {
  const navigation = useNavigate();

  // keystore json v3 export시 필요한 정보(비공개키, 패스워드)
  const [toJsonPrivKey, setToJsonPrivKey] = useState('');
  const [toJsonPassword, setToJsonPassword] = useState('');

  // import할 2가지 타입
  const importTypeList = [
    { type: 'Private Key', name: '비공개 키' },
    { type: 'JSON File', name: 'JSON 파일' },
  ];

  const [currentType, setCurrentType] = useState('Private Key'); // import type
  const [importPrivKey, setImportPrivKey] = useState(''); // 비공개키 type일 때 비공개키 정보
  const [importFileInput, setImportFileInput] = useState(''); // json file type일 때 file 정보
  const [importPassword, setImportPassword] = useState(''); // import 시 필요한 password 정보

  // 키스토어 파일 v3 다운로드
  const { refetch: makeKeystoreV3 } = useGetExportKeystoreV3(
    {
      privateKey: toJsonPrivKey,
      password: toJsonPassword,
    },
    {
      onSuccess(keystoreV3) {
        downloadFile(JSON.stringify(keystoreV3), 'keystoreV3.json');
      },
    },
  );

  /**
   * import 타입에 따른 계정 가져오기
   * @param {string} strategy - import 유형 (Private Key, JSON File)
   * @param {object} args - { password: 비밀번호, privateKey || fileContents: 타입에 따라 비공개 키 or JSON File }
   * @returns {string} selectedAddress - 주소값
   */
  const { data: selectedAddress, refetch: refetchImportStrategy } =
    useGetImportAccountStrategy({
      strategy: currentType,
      args: {
        password: importPassword,
        ...(currentType === 'Private Key'
          ? { privateKey: importPrivKey }
          : { fileContents: importFileInput }),
      },
    });

  const onNextPage = () => {
    navigation('/');
  };

  return (
    <div style={{ padding: 16 }}>
      <Button className="mb-3" onClick={onNextPage}>
        Home
      </Button>

      <TextField
        placeholder="개인키 입력"
        onChange={(e) => {
          setToJsonPrivKey(e.target.value);
        }}
      />
      <TextField
        password
        placeholder="비밀번호 입력"
        onChange={(e) => {
          setToJsonPassword(e.target.value);
        }}
      />
      <Button onClick={makeKeystoreV3} color={THEME_COLOR.WARNING}>
        V3 JSON 다운로드
      </Button>

      <Card title="계정 가져오기" content={selectedAddress} />
      <select
        name="importType"
        className="mb-2"
        onChange={(event) => setCurrentType(event.target.value)}
        value={currentType}
      >
        {importTypeList.map(({ type, name }, index) => (
          <option key={index} value={type}>
            {name}
          </option>
        ))}
      </select>

      {currentType === 'Private Key' && (
        <TextField
          placeholder="비공개 키 문자열을 넣으세요"
          onChange={(e) => {
            setImportPrivKey(e.target.value);
          }}
        />
      )}
      {currentType === 'JSON File' && (
        <FileInput
          readAs="text"
          onLoad={(event) => setImportFileInput(event.target.result)}
          style={{
            padding: '20px 0px 12px 15%',
            fontSize: '15px',
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        />
      )}
      <TextField
        password
        placeholder="비밀번호 입력"
        onChange={(e) => {
          setImportPassword(e.target.value);
        }}
      />
      <Button onClick={refetchImportStrategy} color={THEME_COLOR.SUCCESS}>
        가져오기
      </Button>
    </div>
  );
}

export default JsonFile;
