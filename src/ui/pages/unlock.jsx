import { SECOND } from 'app/constants/time';
import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useMount } from 'react-use';
import Box from 'ui/components/atoms/box';
import Button from 'ui/components/atoms/button';
import TextField from 'ui/components/atoms/text-field';
import Toast from 'ui/components/atoms/toast';
import { useGetVerifyPassword } from 'ui/data/account/account.hooks';

function Unlock() {
  const navigation = useNavigate();
  const { password, setPassword } = useOutletContext();
  const { data, refetch } = useGetVerifyPassword({
    password,
  });
  const [isMount, setIsMount] = useState(false);
  const [isError, setIsError] = useState(false);

  useMount(() => {
    setIsMount(true);
  });

  useEffect(() => {
    if (!isEmpty(data)) {
      navigation('/home');
    } else {
      if (!isMount) return;

      setIsError(true);
      setTimeout(() => {
        setIsError(false);
      }, SECOND);
    }
  }, [data]);

  const handleEnter = (event) => {
    const { key } = event;

    if (key === 'Enter') {
      refetch();
    }
  };

  return (
    <Box as="article" className="unlock">
      <TextField
        className="mb-4 bg-white"
        type="password"
        name="password"
        value={password}
        placeholder="패스워드"
        onChange={(event) => setPassword(event.target.value)}
        onKeyUp={handleEnter}
      />
      <Button
        type="button"
        className="font-bold text-base !bg-dark-blue"
        onClick={refetch}
      >
        잠금 해제
      </Button>
      {isError && (
        <Toast
          isShow={isError}
          severity="error"
          contents="패스워드를 확인해주세요"
        />
      )}
    </Box>
  );
}

export default Unlock;
