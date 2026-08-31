import { Router } from 'express';
import { createOffer, listMyOffers, respondToOffer } from '../controllers/offers.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.post('/', createOffer);
router.get('/', listMyOffers);
router.put('/:id', respondToOffer);

export default router;
