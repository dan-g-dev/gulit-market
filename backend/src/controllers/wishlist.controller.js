import pool from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { LISTING_BASE_SELECT, attachImages } from '../models/listingModel.js';
import { serializeListing } from '../utils/serializeListing.js';

// GET /api/wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const [favRows] = await pool.query(
    'SELECT listing_id FROM favorites WHERE user_id = :userId ORDER BY created_at DESC',
    { userId: req.user.id }
  );
  if (!favRows.length) return res.json({ listings: [] });

  const ids = favRows.map((r) => r.listing_id);
  const [rows] = await pool.query(
    `${LISTING_BASE_SELECT} WHERE l.id IN (${ids.map(() => '?').join(',')})`,
    ids
  );
  const withImages = await attachImages(rows);
  res.json({ listings: withImages.map(serializeListing) });
});

// POST /api/wishlist  { listingId }
export const addToWishlist = asyncHandler(async (req, res) => {
  const { listingId } = req.body;
  if (!listingId) throw new ApiError(400, 'listingId is required');

  const [listingRows] = await pool.query('SELECT id FROM listings WHERE id = :id', { id: listingId });
  if (!listingRows[0]) throw new ApiError(404, 'Listing not found');

  await pool.query(
    'INSERT IGNORE INTO favorites (user_id, listing_id) VALUES (:userId, :listingId)',
    { userId: req.user.id, listingId }
  );
  res.status(201).json({ added: true });
});

// DELETE /api/wishlist/:listingId
export const removeFromWishlist = asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM favorites WHERE user_id = :userId AND listing_id = :listingId', {
    userId: req.user.id,
    listingId: req.params.listingId,
  });
  res.status(204).send();
});
