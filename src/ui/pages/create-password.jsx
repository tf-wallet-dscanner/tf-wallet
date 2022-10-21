import React, { useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useMount } from 'react-use';
import Box from 'ui/components/atoms/box';
import Button from 'ui/components/atoms/button';
import TextField from 'ui/components/atoms/text-field';

function CreatePassword() {
  const { mode } = useParams();
  const navigation = useNavigate();
  const { password, setPassword, setMode } = useOutletContext();
  const [confirmPassword, setConfirmPassword] = useState('');
  const enabled = password && confirmPassword && password === confirmPassword;

  const handleNextPage = () => {
    if (mode === 'create') {
      navigation('/create-mnemonic');
    } else {
      navigation('/confirm-mnemonic');
    }
  };

  useMount(() => {
    setMode(mode);
  });

  return (
    <Box as="article" className="create-password">
      <TextField
        className="mb-4 bg-white"
        type="password"
        name="password"
        value={password}
        placeholder="패스워드 입력"
        onChange={(event) => setPassword(event.target.value)}
      />
      <TextField
        className="mb-4 bg-white"
        type="password"
        name="confirmPassword"
        value={confirmPassword}
        placeholder="패스워드 확인"
        onChange={(event) => setConfirmPassword(event.target.value)}
      />
      <Button
        type="button"
        className="font-bold text-base !bg-dark-blue"
        onClick={handleNextPage}
        disabled={!enabled}
      >
        다음
      </Button>
    </Box>
  );
}

export default CreatePassword;
