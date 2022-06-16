import React from 'react';
import { APP_STAGE } from 'ui/constants/environment';
import { Routes, Route } from 'react-router-dom';

if (APP_STAGE === 'local') {
  require('../mocks');
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div
            className="bg-black text-white"
            style={{ width: '1000px', height: '1000px' }}
          >
            TF Wallet
          </div>
        }
      />
    </Routes>
    // <div
    //   className="bg-black text-white"
    //   style={{ width: '1000px', height: '1000px' }}
    // >
    //   TF Wallet
    // </div>
  );
}

export default App;
