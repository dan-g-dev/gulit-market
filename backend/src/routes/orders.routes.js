import { Router } from 'express';
import { createOrder, listMyOrders, getOrder, updateOrderStatus } from '../controllers/orders.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.post('/', createOrder);
router.get('/', listMyOrders);
router.get('/:id', getOrder);
router.put('/:id/status', updateOrderStatus);

export default router;
