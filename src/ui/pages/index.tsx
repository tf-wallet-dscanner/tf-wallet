import React from 'react';
import ReactDOM from 'react-dom/client';
import 'ui/styles/global.scss';
import App from './App';
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
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </HashRouter>
  </React.StrictMode>,
);
