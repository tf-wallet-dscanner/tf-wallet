import PortStream from 'extension-port-stream';
import browser, { Runtime } from 'webextension-polyfill';

const initApp = async (remotePort: Runtime.Port) => {
  console.log('remotePort: ', remotePort);

  const connectionStream = new PortStream(remotePort);
  console.log('BG connectionStream : ', connectionStream);
};

// browser.runtime.onMessage.addListener(async (message, sender) => {
//   console.log('BG - message : ', message);
//   console.log('BG - sender : ', sender);
// });

browser.runtime.onConnect.addListener(initApp);

export {};
