/**
 * Returns a middleware that appends the DApp origin to request
 *
 * @param {{ origin: string }} opts - The middleware options
 * @returns {Function}
 */
export default function createOriginMiddleware(opts: any) {
  return function originMiddleware(
    /** @type {any} */ req: any,
    /** @type {any} */ _: any,
    /** @type {Function} */ next: any,
  ) {
    req.origin = opts.origin;
    next();
  };
}
