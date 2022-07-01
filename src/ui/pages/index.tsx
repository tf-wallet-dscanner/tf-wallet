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

browser.runtime.connect({ name: 'popup' });

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
