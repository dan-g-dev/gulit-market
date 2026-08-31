import { Router } from 'express';
import { listReviews, createReview } from '../controllers/reviews.controller.js';
import { requireAuth } from '../middleware/auth.js';

// Mounted at /api/listings/:listingId/reviews (see server.js)
const router = Router({ mergeParams: true });

router.get('/', listReviews);
router.post('/', requireAuth, createReview);

export default router;
