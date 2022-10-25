import { Route, Routes } from 'react-router-dom';
import { APP_STAGE } from 'ui/constants/environment';

import Assets from './assets';
import ConfirmMnemonic from './confirm-mnemonic';
import CreateMnemonic from './create-mnemonic';
import CreatePassword from './create-password';
import CreateToken from './create-token';
import EthHistory from './eth-history';
import ExportAccount from './export-account';
import Home from './home';
import ImportAccount from './import-account';
import Intro from './intro';
import Token from './token';
import Transaction, {
  EstimateGas,
  InputAddress,
  TxResult,
} from './transaction';
import Transfer, { InputAddressToken } from './transfer';
import EstimateTokenGas from './transfer/estimate-token-gas';
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
      <Route path="/home" element={<Home />}>
        <Route path="assets" element={<Assets />} />
        <Route path="history" element={<div>history</div>} />
        <Route path="transaction" element={<Transaction />}>
          <Route index element={<InputAddress />} />
          <Route path="estimate-gas" element={<EstimateGas />} />
        </Route>
        <Route path="transfer/:ca" element={<Transfer />}>
          <Route index element={<InputAddressToken />} />
          <Route path="estimate-token-gas" element={<EstimateTokenGas />} />
        </Route>
      </Route>
      <Route path="/tx-success/:txHash" element={<TxResult />} />
      <Route path="/import-account" element={<ImportAccount />} />
      <Route path="/export-account" element={<ExportAccount />} />
      <Route path="/create-token" element={<CreateToken />} />
      <Route path="/token" element={<Token />} />
      <Route path="/eth-history" element={<EthHistory />} />
    </Routes>
  );
}

export default Routing;
