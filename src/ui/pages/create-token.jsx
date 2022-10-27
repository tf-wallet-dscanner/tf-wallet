import React, { useState } from 'react';
import { GrFormClose } from 'react-icons/gr';
import { useNavigate } from 'react-router-dom';
import Box from 'ui/components/atoms/box';
import Button from 'ui/components/atoms/button';
import Container from 'ui/components/atoms/container';
import TextField from 'ui/components/atoms/text-field';
import { useAddToken } from 'ui/data/token';
import useNumeric from 'ui/hooks/useNumeric';

function CreateToken() {
  const navigation = useNavigate();
  const [tokenAddress, setContractAdderss] = useState('');
  const [symbol, setSymbol] = useState('');
  const [decimals, handleNumericValue] = useNumeric('');

  const { mutate } = useAddToken({
    onSuccess(tokenResult) {
      console.log('token:: ', JSON.stringify(tokenResult));
      navigation(-1);
    },
  });

  const addToken = () => {
    mutate({ tokenAddress, symbol, decimals });
  };

  return (
    <Container as="article" className="create-token">
      <Box className="fixed top-0 right-0 p-2" onClick={() => navigation(-1)}>
        <GrFormClose className="cursor-pointer svg-white text-32" />
      </Box>
      <Box className="flex flex-col justify-center h-full">
        <TextField
          className="mb-3 bg-white"
          placeholder="추가할 토큰 CA 주소 입력"
          value={tokenAddress}
          onChange={(event) => setContractAdderss(event.target.value)}
        />
        <TextField
          className="mb-3 bg-white"
          placeholder="심볼 입력"
          value={symbol}
          onChange={(event) => setSymbol(event.target.value)}
        />
        <TextField
          className="mb-3 bg-white"
          placeholder="Decimals 입력"
          value={decimals}
          onChange={handleNumericValue}
        />
        <Button
          type="button"
          className="font-bold text-base !bg-dark-blue"
          onClick={addToken}
        >
          토큰 추가하기
        </Button>
      </Box>
    </Container>
  );
}

export default CreateToken;
