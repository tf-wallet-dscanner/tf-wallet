import React from 'react';
import { APP_STAGE } from 'ui/constants/environment';
import { Routes, Route } from 'react-router-dom';

import About from './about';
import Home from './home';
import Hong from './hong';

if (APP_STAGE === 'local') {
  require('../mocks');
}

function Routing() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/hong" element={<Hong />} />
    </Routes>
  );
}

export default Routing;
