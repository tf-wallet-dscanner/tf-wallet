import browser from 'webextension-polyfill';

import { BackgroundMessages } from './messages';

/*
 * 현재 문서에 스크립트 태그 주입 (inpage.js)
 */
function injectScript() {
  try {
    console.warn('content script injectScript');
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('async', 'false');
    scriptTag.setAttribute('src', browser.runtime.getURL('inpage.js'));
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
  } catch (error) {
    console.error('TF-WALLET: Provider injection failed.', error);
  }
}

function initialize() {
  console.warn('content script initialize');

  // post message를 받는 이벤트 리스너
  window.addEventListener('message', (event) => {
    // We only accept messages from ourselves
    if (event.source !== window) return;

    if (
      event.data.type &&
      event.data.type === BackgroundMessages.INPAGE_TO_BG
    ) {
      console.warn(`Content script received message: ${event.data.text}`);
      browser.runtime.sendMessage(event.data);
    }
  });

  // inpage.js를 웹 페이지에 주입
  injectScript();
}

initialize();
