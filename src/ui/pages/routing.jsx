import { Route, Routes } from 'react-router-dom';
import { APP_STAGE } from 'ui/constants/environment';

import ConfirmMnemonic from './confirm-mnemonic';
import CreateMnemonic from './create-mnemonic';
import CreatePassword from './create-password';
import EthHistory from './eth-history';
import Home from './home';
import ImportAccount from './import-account';
import Intro from './intro';
import JsonFile from './json-file';
import NewAccount from './new-account';
import Provider from './provider';
import Token from './token';
import Transaction, {
  EstimateGas,
  InputAddress,
  InputAddressToken,
  TxResult,
} from './transaction';
import Unlock from './unlock';
import Welcome from './welcome';
import WelcomeSuccess from './welcome-success';

if (APP_STAGE === 'local') {
  require('../mocks');
}

function Routing() {
  return (
    <Routes>
      <Route path="/" element={<Intro />}>
        <Route path="welcome" element={<Welcome />} />
        <Route path="create-password/:mode" element={<CreatePassword />} />
        <Route path="create-mnemonic" element={<CreateMnemonic />} />
        <Route path="confirm-mnemonic" element={<ConfirmMnemonic />} />
        <Route path="welcome-success" element={<WelcomeSuccess />} />
        <Route path="unlock" element={<Unlock />} />
      </Route>
      <Route path="/home" element={<Home />} />
      <Route path="/provider" element={<Provider />} />
      <Route path="/transaction" element={<Transaction />}>
        <Route index element={<InputAddress />} />
        <Route path="input-address-token" element={<InputAddressToken />} />
        <Route path="estimate-gas" element={<EstimateGas />} />
        <Route path="result/:txHash" element={<TxResult />} />
      </Route>
      <Route path="/new-account" element={<NewAccount />} />
      <Route path="/import-account" element={<ImportAccount />} />
      <Route path="/json-file" element={<JsonFile />} />
      <Route path="/token" element={<Token />} />
      <Route path="/eth-history" element={<EthHistory />} />
    </Routes>
  );
}

export default Routing;
