import { Router } from 'express';
import { getProvidersStatus, verifyPayment } from '../controllers/payments.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/providers', getProvidersStatus);
router.post('/:orderId/verify', requireAuth, verifyPayment);

export default router;
