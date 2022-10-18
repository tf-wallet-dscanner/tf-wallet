import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';

function WelcomeSuccess() {
  const navigation = useNavigate();

  return (
    <article>
      <Button
        type="button"
        className="font-bold text-base !bg-dark-blue"
        onClick={() => navigation('/home')}
      >
        Wallet 시작
      </Button>
    </article>
  );
}

export default WelcomeSuccess;
