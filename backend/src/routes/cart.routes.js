import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cart.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:cartItemId', updateCartItem);
router.delete('/items/:cartItemId', removeCartItem);
router.delete('/', clearCart);

export default router;
