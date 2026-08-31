import { Router } from 'express';
import {
  listListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
} from '../controllers/listings.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ROLES } from '../utils/roles.js';

const router = Router();

router.get('/', listListings);
router.get('/:id', getListing);
router.post('/', requireAuth, requireRole(ROLES.SELLER, ROLES.ADMIN), createListing);
router.put('/:id', requireAuth, requireRole(ROLES.SELLER, ROLES.ADMIN), updateListing);
router.delete('/:id', requireAuth, requireRole(ROLES.SELLER, ROLES.ADMIN), deleteListing);

export default router;
