import React from 'react';
import ReactDOM from 'react-dom/client';
import 'ui/styles/global.scss';
import 'ui/utils/disable-console';
import Routing from './routing';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { HashRouter } from 'react-router-dom';
import browser from 'webextension-polyfill';

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
