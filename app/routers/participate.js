import { Router } from 'express';
import { withTryCatch } from '../controllers/withTryCatchController.js';
import { participateController } from '../controllers/participateController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';

// Create a new router instance
export const router = Router();

// Route to get all participation records, requires authentication
router.get('/', authenticateToken, withTryCatch(participateController.getAll));

// Route to get a participation record by its ID, requires authentication
router.get(
  '/:id',
  authenticateToken,
  withTryCatch(participateController.getById)
);

// Route to create a new participation record, requires authentication
router.post(
  '/create',
  authenticateToken,
  withTryCatch(participateController.createParticipate)
);

// Route to update a participation record by its ID, requires authentication
router.patch(
  '/:id',
  authenticateToken,
  withTryCatch(participateController.patchParticipate)
);
