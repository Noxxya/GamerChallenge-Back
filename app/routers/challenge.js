import { Router } from 'express';
import { withTryCatch } from '../controllers/withTryCatchController.js';
import { challengeController } from '../controllers/challengeController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';

// Create a new router instance
export const router = Router();

// Route to get all challenges
router.get('/', withTryCatch(challengeController.getAll));

// Route to get recent validated challenges

router.get(
  '/recent',
  withTryCatch(challengeController.getRecentValidatedChallenges)
);

// Route to get top games based on challenges

router.get(
  '/top-games',
  withTryCatch(challengeController.getTopGamesByChallenges)
);

// Route to get unvalidated challenges, requires authentication
router.get(
  '/unvalidated',
  withTryCatch(challengeController.getUnvalidatedChallenges)
);

// Route to get a challenge by its ID
router.get('/:id', withTryCatch(challengeController.getById));

// Route to create a new challenge, requires authentication

router.post('/create', withTryCatch(challengeController.createChallenge));

// Route to update a challenge by its ID, requires authentication
router.patch(
  '/:id',
  authenticateToken,
  withTryCatch(challengeController.patchChallenge)
);
