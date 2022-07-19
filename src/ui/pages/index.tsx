import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { HashRouter } from 'react-router-dom';
import 'ui/styles/global.scss';
import 'ui/utils/disable-console';
import browser from 'webextension-polyfill';

import Routing from './routing';

const root = ReactDOM.createRoot(
  document.getElementById('popup') as HTMLElement,
);
const queryClient = new QueryClient();

const extensionPort = browser.runtime.connect({ name: 'popup' });
//const connectionStream = new PortStream(extensionPort);

extensionPort.onMessage.addListener((message) => {
  if (message?.name === 'CONNECTION_READY') {
    //initializeUiWithTab(activeTab);
    console.log('UI - CONNECTION_READY', message);
  }
});

root.render(
  <React.StrictMode>
    <HashRouter>
      <QueryClientProvider client={queryClient}>
        <Routing />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </HashRouter>
  </React.StrictMode>,
);
