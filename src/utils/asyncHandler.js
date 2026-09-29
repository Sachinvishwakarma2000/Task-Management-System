/**
 * Wraps asynchronous route handlers to catch rejected promises and forward to the error middleware.
 *
 * @param {Function} fn - Asynchronous Express route handler or middleware
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
