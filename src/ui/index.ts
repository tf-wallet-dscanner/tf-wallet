import * as actions from './store/actions';

async function startApp(
  metamaskState: any,
  backgroundConnection: any,
  opts: any,
) {
  console.log('launchMetamaskUi: startApp: Start!');
  console.log(
    `metamaskState[${metamaskState}] backgroundConnection[${backgroundConnection} opts[${opts}]]`,
  );
}

export default function launchMetamaskUi(opts: any, cb: any) {
  const { backgroundConnection } = opts;
  actions._setBackgroundConnection(backgroundConnection);
  // check if we are unlocked first
  backgroundConnection.getState(function (err: any, metamaskState: any) {
    if (err) {
      cb(err, metamaskState);
      return;
    }
    startApp(metamaskState, backgroundConnection, opts).then((store: any) => {
      //setupDebuggingHelpers(store);
      cb(null, store);
    });
  });
}
