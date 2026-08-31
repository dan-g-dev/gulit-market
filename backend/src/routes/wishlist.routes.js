import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlist.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:listingId', removeFromWishlist);

export default router;
