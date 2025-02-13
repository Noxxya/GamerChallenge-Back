import { Router } from 'express';
import { withTryCatch } from '../controllers/withTryCatchController.js';
import { formController } from '../controllers/categoryController.js';

// Create a new router instance
export const router = Router();

// Route to get all categories
router.get('/categories', withTryCatch(formController.getCategories));

// Route to search games with a search term
router.get('/games/search', withTryCatch(formController.searchGames));
