import { Router } from 'express';
import { withTryCatch } from '../controllers/withTryCatchController.js';
import { voteController } from '../controllers/voteController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';

export const router = Router();

// Votes sur les challenges
router.post('/challenge/add',authenticateToken, withTryCatch(voteController.challenge.addVote));
router.post('/challenge/remove',authenticateToken, withTryCatch(voteController.challenge.removeVote));

// Votes sur les participations
router.post('/participate/add',authenticateToken, withTryCatch(voteController.participate.addVote));
router.post('/participate/remove',authenticateToken, withTryCatch(voteController.participate.removeVote));


