import { useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';

import { BackgroundMessages } from '../../app/messages';
import Messenger from '../../app/messenger';

function About() {
  const navigation: NavigateFunction = useNavigate();

  const [helloText, setHelloText] = useState<string>('');
  const [addressText, setAddressText] = useState<string>('');

  const onNextPage = (): void => {
    navigation('/');
  };

  const eventHello = async () => {
    try {
      const res = await Messenger.sendMessageToBackground(
        BackgroundMessages.SAY_HELLO_TO_BG,
        {
          message: 'Hello from popup',
        },
      );
      setHelloText(res.message);

      console.log('eventHello response', res);
    } catch (err) {
      console.log('eventHello err', err);
    }
  };

  const eventSetAddress = async () => {
    try {
      const res = await Messenger.sendMessageToBackground(
        BackgroundMessages.SET_ADDRESS_TO_BG,
        {
          message: '0x111',
        },
      );
      setAddressText(res.message);

      console.log('eventSetAddress response', res);
    } catch (err) {
      console.log('eventSetAddress err', err);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <span>About page</span>
      <button onClick={onNextPage}>Home</button>
      <ul></ul>
      <button onClick={eventHello}>Hello</button>
      <div>{helloText}</div>
      <ul></ul>
      <button onClick={eventSetAddress}>SetAddress</button>
      <div>{addressText}</div>
    </div>
  );
}

export default About;
