import { Router } from 'express';
import { withTryCatch } from '../controllers/withTryCatchController.js';
import { authController } from '../controllers/authController.js';

// Create a new router instance
export const router = Router();

// Route to handle user login
router.post('/', withTryCatch(authController.login));
