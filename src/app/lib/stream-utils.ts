import ObjectMultiplex from '@metamask/object-multiplex';
import pump from 'pump';

/**
 * Sets up stream multiplexing for the given stream
 *
 * @param {any} connectionStream - the stream to mux
 * @returns {stream.Stream} the multiplexed stream
 */
export function setupMultiplex(connectionStream: any) {
  const mux = new ObjectMultiplex();
  console.log('mux', mux);
  pump(connectionStream, mux, connectionStream, (err) => {
    if (err) {
      console.error(err);
    }
  });
  console.log('mux', mux);
  return mux;
}
