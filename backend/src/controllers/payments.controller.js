import pool from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listProviders, getProvider } from '../services/paymentService.js';

// GET /api/payments/providers — which payment methods exist and whether
// they're actually usable right now (COD always is; TeleBirr only once
// merchant credentials are configured).
export const getProvidersStatus = asyncHandler(async (req, res) => {
  res.json({ providers: listProviders() });
});

// POST /api/payments/:orderId/verify — re-check payment status with the
// provider (useful for TeleBirr once it's live; a no-op-ish poll for COD).
export const verifyPayment = asyncHandler(async (req, res) => {
  const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = :id', {
    id: req.params.orderId,
  });
  const order = orderRows[0];
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.buyer_id !== req.user.id) throw new ApiError(403, 'Not your order');

  const provider = getProvider(order.payment_provider);
  const result = await provider.verify({ transactionReference: order.transaction_reference });

  await pool.query('UPDATE orders SET payment_status = :status WHERE id = :id', {
    status: result.status,
    id: order.id,
  });
  await pool.query('UPDATE payments SET status = :status WHERE order_id = :id', {
    status: result.status,
    id: order.id,
  });

  res.json({ status: result.status });
});
