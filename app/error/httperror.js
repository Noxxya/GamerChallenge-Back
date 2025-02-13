/**
 * Custom error class for handling HTTP errors.
 * This class extends the built-in Error class to include
 * an HTTP status code along with the error message.
 */

export class HttpError extends Error {
  /**
   * Creates an instance of HttpError.
   *
   * @param {number} status - The HTTP status code associated with the error.
   * @param {string} message - The error message to be displayed.
   */
  constructor(status, message) {
    super(message); // Call the parent constructor with the error message
    this.status = status; // Assign the HTTP status code to the instance
  }
}
