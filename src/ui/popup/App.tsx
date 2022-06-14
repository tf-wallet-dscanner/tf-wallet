import React from 'react';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>TF Wallet</div>} />
    </Routes>
  );
}

export default App;
