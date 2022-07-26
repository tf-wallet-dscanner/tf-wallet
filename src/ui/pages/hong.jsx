import { useCallback, useState } from 'react';
import { FaEye, FaEyeSlash, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Alert from 'ui/components/atoms/alert/alert';
import Box from 'ui/components/atoms/box';
import Tabs from 'ui/components/atoms/tabs';
import TextField from 'ui/components/atoms/text-field';

// 탭 컴포넌트 1
function FirstTab() {
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'red' }}>
      첫번째 탭
    </div>
  );
}

// 탭 컴포넌트 2
function SecondTab() {
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'green' }}>
      두번째 탭
    </div>
  );
}

// 탭 컴포넌트 3
function ThirdTab() {
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'blue' }}>
      세번째 탭
    </div>
  );
}

function Hong() {
  const navigation = useNavigate();

  const onNextPage = () => {
    navigation('/');
  };

  const [searchText, setSearchText] = useState('');
  const [password, setPassword] = useState('');
  const [passwordHide, setPasswordHide] = useState(false);

  const togglePasswordHide = useCallback(() => {
    setPasswordHide(!passwordHide);
  }, [passwordHide]);

  // 탭 데이터
  const tabData = [
    { title: 'new', component: <FirstTab /> },
    { title: 'import', component: <SecondTab /> },
    { title: 'test', component: <ThirdTab /> },
  ];

  const successCallBackData = () => {
    // 탭 변경 시 호출되는 callback
  };

  return (
    <div style={{ padding: 16 }}>
      <button type="button" onClick={onNextPage}>
        Home
      </button>

      <Tabs tabData={tabData} value={2} onChange={successCallBackData} />

      <TextField
        placeholder="검색어 입력"
        model={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
        }}
        prefixIcon={<FaSearch />}
      />

      <TextField
        password={!passwordHide}
        placeholder="비밀번호 입력"
        model={password}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
        suffixIcon={
          passwordHide ? (
            <FaEyeSlash onClick={togglePasswordHide} />
          ) : (
            <FaEye onClick={togglePasswordHide} />
          )
        }
      />

      <Box className="w-[100] h-[100] bg-rose-300">박스테스트</Box>
      <Box className="flex flex-row bg-cyan-300 text-center">
        <Box className="flex-auto">박스1</Box>
        <Box className="flex-auto">박스2</Box>
      </Box>

      <Alert
        severity="error"
        title="Error"
        contents="This is an error alert — check it out!"
      />

      <Alert
        severity="warning"
        contents="This is a warning alert — check it out!"
      />

      <Alert
        severity="info"
        title="Info"
        contents={
          <div>
            This is an info alert —{' '}
            <span className="font-bold">check it out!</span>
          </div>
        }
      />

      <Alert
        severity="success"
        title="Success"
        contents="This is a success alert — check it out!"
      />
    </div>
  );
}

export default Hong;
