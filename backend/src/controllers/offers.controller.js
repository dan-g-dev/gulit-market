import pool from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function serializeOffer(row) {
  return {
    id: row.id,
    listingId: row.listing_id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    amountETB: Number(row.amount_etb),
    message: row.message,
    status: row.status,
    counterAmountETB: row.counter_amount_etb != null ? Number(row.counter_amount_etb) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// POST /api/offers  { listingId, amountETB, message }  (buyer)
export const createOffer = asyncHandler(async (req, res) => {
  const { listingId, amountETB, message } = req.body;
  if (!listingId || !amountETB) throw new ApiError(400, 'listingId and amountETB are required');

  const [listingRows] = await pool.query('SELECT * FROM listings WHERE id = :id', { id: listingId });
  const listing = listingRows[0];
  if (!listing) throw new ApiError(404, 'Listing not found');
  if (!listing.is_negotiable) throw new ApiError(400, 'This listing does not accept offers');
  if (listing.seller_id === req.user.id) throw new ApiError(400, 'You cannot make an offer on your own listing');

  const [result] = await pool.query(
    `INSERT INTO offers (listing_id, buyer_id, seller_id, amount_etb, message)
     VALUES (:listingId, :buyerId, :sellerId, :amount, :message)`,
    { listingId, buyerId: req.user.id, sellerId: listing.seller_id, amount: amountETB, message: message ?? null }
  );

  const [rows] = await pool.query('SELECT * FROM offers WHERE id = :id', { id: result.insertId });
  res.status(201).json({ offer: serializeOffer(rows[0]) });
});

// GET /api/offers  — offers the current user made (as buyer) or received (as seller)
export const listMyOffers = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM offers WHERE buyer_id = :userId OR seller_id = :userId ORDER BY created_at DESC',
    { userId: req.user.id }
  );
  res.json({ offers: rows.map(serializeOffer) });
});

// PUT /api/offers/:id  { status: 'accepted' | 'rejected' | 'countered', counterAmountETB? }  (seller)
export const respondToOffer = asyncHandler(async (req, res) => {
  const { status, counterAmountETB } = req.body;
  if (!['accepted', 'rejected', 'countered'].includes(status)) {
    throw new ApiError(400, "status must be 'accepted', 'rejected' or 'countered'");
  }
  if (status === 'countered' && !counterAmountETB) {
    throw new ApiError(400, 'counterAmountETB is required when countering');
  }

  const [rows] = await pool.query('SELECT * FROM offers WHERE id = :id', { id: req.params.id });
  const offer = rows[0];
  if (!offer) throw new ApiError(404, 'Offer not found');
  if (offer.seller_id !== req.user.id) throw new ApiError(403, 'You did not receive this offer');
  if (offer.status !== 'pending') throw new ApiError(400, 'This offer has already been responded to');

  await pool.query(
    'UPDATE offers SET status = :status, counter_amount_etb = :counterAmount WHERE id = :id',
    { status, counterAmount: status === 'countered' ? counterAmountETB : null, id: offer.id }
  );

  const [updated] = await pool.query('SELECT * FROM offers WHERE id = :id', { id: offer.id });
  res.json({ offer: serializeOffer(updated[0]) });
});
