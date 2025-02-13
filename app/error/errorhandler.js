/**
 * Centralized error handling middleware for Express applications.
 * This function captures errors thrown in the application,
 * determines the appropriate HTTP status code, and sends
 * a JSON response with the error message.
 *
 * @param {Object} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */

export function errorHandler(err, req, res, next) {
  // Determine the HTTP status code from the error or default to 500 (Internal Server Error)
  const httpStatus = err.status ? err.status : 500;

  // If the error is a validation error, extract the first validation message
  if (err.message === 'Validation error') {
    err.message = err.errors[0].message;
  }

  // Send the response with the appropriate status code and error message
  res.status(httpStatus).json({ error: err.message });
}
