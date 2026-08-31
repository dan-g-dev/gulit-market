import { Router } from 'express';
import { listListings } from '../controllers/listings.controller.js';

// /api/search is the same query engine as /api/listings, exposed under the
// name the frontend's search bar expects.
const router = Router();
router.get('/', listListings);

export default router;
