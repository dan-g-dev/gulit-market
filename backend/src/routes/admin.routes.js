import { Router } from 'express';
import {
  getReports,
  listUsers,
  updateUser,
  listAllListings,
  moderateListing,
  listAllOrders,
} from '../controllers/admin.controller.js';
import { createCategory, deleteCategory } from '../controllers/categories.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { ROLES } from '../utils/roles.js';

const router = Router();
router.use(requireAuth, requireRole(ROLES.ADMIN));

router.get('/reports', getReports);
router.get('/users', listUsers);
router.put('/users/:id', updateUser);
router.get('/listings', listAllListings);
router.put('/listings/:id', moderateListing);
router.get('/orders', listAllOrders);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

export default router;
