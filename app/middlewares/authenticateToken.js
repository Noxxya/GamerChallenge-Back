import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET; // Secret key for signing JWTs

/**
 * Middleware to authenticate JWT tokens.
 * This function checks for the presence of a token in the request headers,
 * verifies the token, and sets the user information in the request object.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization; // Get the authorization header
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token from the header

  // Check if the token is provided
  if (!token) {
    console.log('Token not provided in request');
    return res.status(401).json({ message: 'Access token required' });
  }

  // Verify the token using the secret key
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log('Token verification error:', err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }



    // Ensure that `req.user` contains `userId` and other relevant information
    req.user = { userId: decoded.userId, email: decoded.email };

    next(); // Call the next middleware function
  });
};
