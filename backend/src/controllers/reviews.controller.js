import pool from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/listings/:listingId/reviews
export const listReviews = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT r.*, u.full_name AS reviewer_name
     FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.listing_id = :listingId ORDER BY r.created_at DESC`,
    { listingId: req.params.listingId }
  );
  res.json({
    reviews: rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      reviewerName: r.reviewer_name,
      createdAt: r.created_at,
    })),
  });
});

// POST /api/listings/:listingId/reviews  { orderId, rating, comment }
// Reviews are only allowed against a delivered order that actually
// contained this listing — "eligible purchases" per the spec.
export const createReview = asyncHandler(async (req, res) => {
  const { orderId, rating, comment } = req.body;
  const listingId = req.params.listingId;

  if (!orderId) throw new ApiError(400, 'orderId is required');
  if (!rating || rating < 1 || rating > 5) throw new ApiError(400, 'rating must be between 1 and 5');

  const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = :id', { id: orderId });
  const order = orderRows[0];
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.buyer_id !== req.user.id) throw new ApiError(403, 'You did not place this order');
  if (order.status !== 'delivered') throw new ApiError(400, 'You can only review delivered orders');

  const [itemRows] = await pool.query(
    'SELECT 1 FROM order_items WHERE order_id = :orderId AND listing_id = :listingId LIMIT 1',
    { orderId, listingId }
  );
  if (!itemRows[0]) throw new ApiError(400, 'This order did not include that listing');

  const [existing] = await pool.query(
    'SELECT id FROM reviews WHERE order_id = :orderId AND listing_id = :listingId',
    { orderId, listingId }
  );
  if (existing[0]) throw new ApiError(409, 'You already reviewed this item for this order');

  await pool.query(
    `INSERT INTO reviews (listing_id, order_id, user_id, rating, comment)
     VALUES (:listingId, :orderId, :userId, :rating, :comment)`,
    { listingId, orderId, userId: req.user.id, rating, comment: comment ?? null }
  );

  res.status(201).json({ created: true });
});
