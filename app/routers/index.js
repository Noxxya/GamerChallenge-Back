import { Router } from 'express';
import { errorHandler } from '../error/errorhandler.js';
import { HttpError } from '../error/httperror.js';
import { router as challengeRouter } from './challenge.js';
import { router as participateRouter } from './participate.js';
import { router as userRouter } from './user.js';
import { router as voteRouter } from './vote.js';
import { router as loginRouter } from './login.js';
import { router as formsRouter } from './formRoutes.js';

// Create a new router instance
export const router = Router();

// Use challenge routes
router.use('/challenge', challengeRouter);

// Use participate routes
router.use('/participate', participateRouter);

// Use user routes
router.use('/user', userRouter);

// Use vote routes
router.use('/vote', voteRouter);

// Use login routes
router.use('/login', loginRouter);

// Use form-related routes under /api
router.use('/api', formsRouter);

// Handle 404 errors (resource not found)
router.use((req, res, next) => {
  next(new HttpError(404, 'Resource not found'));
});

// Use the error handler for any errors that occur
router.use(errorHandler);
