import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BackgroundMessages } from '../../app/messages';
import Messenger from '../../app/messenger';

function About() {
  const navigation = useNavigate();
  const [helloText, setHelloText] = useState('');
  const [addressText, setAddressText] = useState('');

  const onNextPage = () => {
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
      console.log('eventHello response', res);
      setHelloText(res.message);
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
      console.log('eventSetAddress response', res);
      setAddressText(res.message.address);
    } catch (err) {
      console.log('eventSetAddress err', err);
    }
  };
  return (
    <div style={{ padding: 16 }}>
      <span>About page</span>
      <button type="button" onClick={onNextPage}>
        Home
      </button>
      <ul> </ul>
      <button type="button" onClick={eventHello}>
        Hello
      </button>
      <div>{helloText}</div>
      <ul> </ul>
      <button type="button" onClick={eventSetAddress}>
        SetAddress
      </button>
      <div>{addressText}</div>
    </div>
  );
}

export default About;
