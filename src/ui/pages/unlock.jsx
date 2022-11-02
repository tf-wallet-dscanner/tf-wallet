import { SECOND } from 'app/constants/time';
import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Box from 'ui/components/atoms/box';
import Button from 'ui/components/atoms/button';
import TextField from 'ui/components/atoms/text-field';
import Toast from 'ui/components/atoms/toast';
import { useSubmitPassword } from 'ui/data/account/account.hooks';

function Unlock() {
  const navigation = useNavigate();
  const { password, setPassword } = useOutletContext();
  const [isError, setIsError] = useState(false);
  const { mutate } = useSubmitPassword({
    onSuccess() {
      navigation('/home');
    },
    onError() {
      setIsError(true);
      setTimeout(() => {
        setIsError(false);
      }, SECOND);
    },
  });

  const handleEnter = (event) => {
    const { key } = event;

    if (key === 'Enter') {
      mutate({ password });
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
        onClick={() => mutate({ password })}
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
