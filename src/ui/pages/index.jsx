import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { HashRouter } from 'react-router-dom';
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

browser.runtime.connect({ name: 'popup' });

const devtool = process.env.DEVTOOL;

root.render(
  <HashRouter>
    <QueryClientProvider client={queryClient}>
      <Routing />
      {devtool && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </HashRouter>,
);
