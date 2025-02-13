import { Router } from 'express';
import { withTryCatch } from '../controllers/withTryCatchController.js';
import { userController } from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';

// Create a new router instance
export const router = Router();

// Route to get all users, requires authentication
router.get('/', withTryCatch(userController.getAll));

// Route to get top users by experience points (XP)
router.get('/top-xp', withTryCatch(userController.getTopUsersByXP));

// Route to get top users with their current positions, requires authentication
router.get(
  '/top-with-position',
  authenticateToken,
  withTryCatch(userController.getTopUsersWithCurrentPosition)
);

// Route to get the profile of the authenticated user, requires authentication
router.get(
  '/profile',
  authenticateToken,
  withTryCatch(userController.getUserById)
);

// Route to update the profile of the authenticated user, requires authentication
router.patch(
  '/profile',
  authenticateToken,
  withTryCatch(userController.updateUser)
);

// Route to sign up a new user
router.post('/signup', withTryCatch(userController.createUser));
