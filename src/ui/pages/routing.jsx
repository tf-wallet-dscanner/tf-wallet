import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { APP_STAGE } from 'ui/constants/environment';

import About from './about';
import Account from './account';
import Home from './home';
import Hong from './hong';
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
      <Route path="/account" element={<Account />} />
    </Routes>
  );
}

export default Routing;
