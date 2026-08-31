import { Router } from 'express';
import { getSellerProfile, getMyProfile, updateMyProfile, getMyOrders } from '../controllers/sellers.controller.js';
import { myListings } from '../controllers/listings.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

// Specific /me routes must come before the /:id catch-all
router.get('/me', requireAuth, requireRole(ROLES.SELLER, ROLES.ADMIN), getMyProfile);
router.put('/me', requireAuth, requireRole(ROLES.SELLER, ROLES.ADMIN), updateMyProfile);
router.get('/me/listings', requireAuth, requireRole(ROLES.SELLER, ROLES.ADMIN), myListings);
router.get('/me/orders', requireAuth, requireRole(ROLES.SELLER, ROLES.ADMIN), getMyOrders);
router.get('/:id', getSellerProfile);

export default router;
