import React from 'react';
import { APP_STAGE } from 'ui/constants/environment';
import { Routes, Route } from 'react-router-dom';

if (APP_STAGE === 'local') {
  require('../mocks');
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>TF Wallet</div>} />
    </Routes>
  );
}

export default App;
