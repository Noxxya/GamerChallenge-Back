/**
 * Higher-order function to wrap middleware with error handling.
 * This function catches any errors thrown by the middleware
 * and passes them to the next error-handling middleware.
 *
 * @param {Function} middleware - The middleware function to wrap.
 * @returns {Function} - A new middleware function with error handling.
 */

export function withTryCatch(middleware) {
  return async function (req, res, next) {
    try {
      // Call the original middleware function
      await middleware(req, res, next);
    } catch (error) {
      // If an error occurs, pass it to the next error handler
      next(error);
    }
  };
}
