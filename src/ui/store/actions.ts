import pify from 'pify';

let background: any = null;
let promisifiedBackground: any = null;

export function _setBackgroundConnection(backgroundConnection: any) {
  background = backgroundConnection;
  promisifiedBackground = pify(background);
  console.log('promisifiedBackground', promisifiedBackground);
  return promisifiedBackground;
}
