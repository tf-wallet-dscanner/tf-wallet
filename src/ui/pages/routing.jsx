import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { APP_STAGE } from 'ui/constants/environment';

import About from './about';
import Home from './home';
import Hong from './hong';
import ImportAccount from './import-account';
import NewAccount from './new-account';
import Provider from './provider';

if (APP_STAGE === 'local') {
  require('../mocks');
}

function Routing() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/provider" element={<Provider />} />
      <Route path="/about" element={<About />} />
      <Route path="/hong" element={<Hong />} />
      <Route path="/new-account" element={<NewAccount />} />
      <Route path="/import-account" element={<ImportAccount />} />
    </Routes>
  );
}

export default Routing;
