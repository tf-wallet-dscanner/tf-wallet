import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { APP_STAGE } from 'ui/constants/environment';

import Home from './home';
import ImportAccount from './import-account';
import JsonFile from './json-file';
import NewAccount from './new-account';
import Provider from './provider';
import Transaction, {
  EstimateGas,
  InputAddress,
  TxResult,
} from './transaction';

if (APP_STAGE === 'local') {
  require('../mocks');
}

function Routing() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/provider" element={<Provider />} />
      <Route path="/transaction" element={<Transaction />}>
        <Route index element={<InputAddress />} />
        <Route path="estimate-gas" element={<EstimateGas />} />
        <Route path="result/:txHash" element={<TxResult />} />
      </Route>
      <Route path="/new-account" element={<NewAccount />} />
      <Route path="/import-account" element={<ImportAccount />} />
      <Route path="/json-file" element={<JsonFile />} />
    </Routes>
  );
}

export default Routing;
