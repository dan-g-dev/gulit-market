import pool from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { attachImages, LISTING_BASE_SELECT } from '../models/listingModel.js';
import { serializeListing } from '../utils/serializeListing.js';

async function getOrCreateCart(userId) {
  const [rows] = await pool.query('SELECT * FROM cart WHERE user_id = :userId', { userId });
  if (rows[0]) return rows[0];

  const [result] = await pool.query('INSERT INTO cart (user_id) VALUES (:userId)', { userId });
  return { id: result.insertId, user_id: userId };
}

async function loadCart(userId) {
  const cart = await getOrCreateCart(userId);
  const [items] = await pool.query(
    'SELECT * FROM cart_items WHERE cart_id = :cartId ORDER BY created_at ASC',
    { cartId: cart.id }
  );
  if (!items.length) return [];

  const listingIds = items.map((i) => i.listing_id);
  const [listingRows] = await pool.query(
    `${LISTING_BASE_SELECT} WHERE l.id IN (${listingIds.map(() => '?').join(',')})`,
    listingIds
  );
  const withImages = await attachImages(listingRows);
  const listingById = Object.fromEntries(withImages.map((l) => [l.id, serializeListing(l)]));

  return items.map((item) => ({
    cartItemId: item.id,
    quantity: item.quantity,
    listing: listingById[item.listing_id] || null,
  }));
}

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  res.json({ items: await loadCart(req.user.id) });
});

// POST /api/cart/items  { listingId, quantity }
export const addToCart = asyncHandler(async (req, res) => {
  const { listingId, quantity = 1 } = req.body;
  if (!listingId) throw new ApiError(400, 'listingId is required');
  if (quantity < 1) throw new ApiError(400, 'quantity must be at least 1');

  const [listingRows] = await pool.query('SELECT * FROM listings WHERE id = :id', { id: listingId });
  const listing = listingRows[0];
  if (!listing) throw new ApiError(404, 'Listing not found');
  if (listing.status !== 'active') throw new ApiError(400, 'This listing is not available');

  const cart = await getOrCreateCart(req.user.id);

  await pool.query(
    `INSERT INTO cart_items (cart_id, listing_id, quantity) VALUES (:cartId, :listingId, :quantity)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    { cartId: cart.id, listingId, quantity }
  );

  res.status(201).json({ items: await loadCart(req.user.id) });
});

// PUT /api/cart/items/:cartItemId  { quantity }
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (quantity == null || quantity < 1) throw new ApiError(400, 'quantity must be at least 1');

  const cart = await getOrCreateCart(req.user.id);
  const [result] = await pool.query(
    'UPDATE cart_items SET quantity = :quantity WHERE id = :id AND cart_id = :cartId',
    { quantity, id: req.params.cartItemId, cartId: cart.id }
  );
  if (!result.affectedRows) throw new ApiError(404, 'Cart item not found');

  res.json({ items: await loadCart(req.user.id) });
});

// DELETE /api/cart/items/:cartItemId
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  const [result] = await pool.query('DELETE FROM cart_items WHERE id = :id AND cart_id = :cartId', {
    id: req.params.cartItemId,
    cartId: cart.id,
  });
  if (!result.affectedRows) throw new ApiError(404, 'Cart item not found');

  res.json({ items: await loadCart(req.user.id) });
});

// DELETE /api/cart  (clear)
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  await pool.query('DELETE FROM cart_items WHERE cart_id = :cartId', { cartId: cart.id });
  res.json({ items: [] });
});

export { getOrCreateCart, loadCart };
