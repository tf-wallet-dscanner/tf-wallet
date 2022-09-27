/* eslint-disable react/jsx-no-constructed-context-values */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { HashRouter } from 'react-router-dom';
import { PortStreamContext } from 'ui/store/port';
import 'ui/styles/global.scss';
import 'ui/utils/disable-console';
import browser from 'webextension-polyfill';

import Routing from './routing';

const root = ReactDOM.createRoot(document.getElementById('popup'));
const queryClient = new QueryClient();
queryClient.setDefaultOptions({
  queries: {
    staleTime: Infinity,
    cacheTime: 0,
    refetchOnWindowFocus: false,
  },
});

const port = browser.runtime.connect({ name: 'popup' });
port.postMessage('connect react component!');

const devtool = process.env.DEVTOOL;

root.render(
  <HashRouter>
    <QueryClientProvider client={queryClient}>
      <PortStreamContext.Provider value={{ port }}>
        <Routing />
      </PortStreamContext.Provider>
      {devtool && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </HashRouter>,
);
