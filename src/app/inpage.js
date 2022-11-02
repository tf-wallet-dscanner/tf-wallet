import { BackgroundMessages } from './messages';

// 웹 페이지상에서 백그라운드에 메세지 보내기 위한 window 객체안에 메소드 선언
window.sendMessageBackground = () => {
  // postMessage 전송
  window.postMessage(
    { type: BackgroundMessages.INPAGE_TO_BG, text: 'connect dkargo wallet' },
    '*',
  );
};

export {};
