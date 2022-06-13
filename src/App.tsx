import React from 'react';
import { APP_STAGE } from './constants/environment';

if (APP_STAGE === 'local') {
  require('./mocks');
}

function App() {
  return <div className="App">TF Wallet</div>;
}

export default App;
