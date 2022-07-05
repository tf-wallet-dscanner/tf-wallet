import pify from 'pify';

let background = null;
let promisifiedBackground = null;

export function _setBackgroundConnection(backgroundConnection: any) {
  background = backgroundConnection;
  promisifiedBackground = pify(background);
  return promisifiedBackground;
}
