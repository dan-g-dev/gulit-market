import pool from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../utils/roles.js';
import { serializeListing } from '../utils/serializeListing.js';
import { LISTING_BASE_SELECT, attachImages, findListingById } from '../models/listingModel.js';

// GET /api/listings  and  GET /api/search
// Supports: q, category, location, min_price, max_price, condition, sort, page, limit
export const listListings = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    location,
    min_price: minPrice,
    max_price: maxPrice,
    condition,
    sort = 'newest',
    page = '1',
    limit = '24',
  } = req.query;

  const where = ["l.status = 'active'"];
  const params = {};

  if (q) {
    where.push('MATCH(l.title, l.description) AGAINST (:q IN NATURAL LANGUAGE MODE)');
    params.q = q;
  }
  if (category) {
    where.push('(l.category_id = :category OR c.parent_id = :category)');
    params.category = category;
  }
  if (location) {
    where.push('(l.location_id = :location OR loc.parent_id = :location)');
    params.location = location;
  }
  if (minPrice) {
    where.push('l.price_etb >= :minPrice');
    params.minPrice = Number(minPrice);
  }
  if (maxPrice) {
    where.push('l.price_etb <= :maxPrice');
    params.maxPrice = Number(maxPrice);
  }
  if (condition) {
    where.push('l.condition_type = :condition');
    params.condition = condition;
  }

  const whereSql = `WHERE ${where.join(' AND ')}`;

  const sortMap = {
    newest: 'l.created_at DESC',
    price_asc: 'l.price_etb ASC',
    price_desc: 'l.price_etb DESC',
    featured: 'l.is_featured DESC, l.created_at DESC',
  };
  const orderSql = sortMap[sort] || sortMap.newest;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));
  const offset = (pageNum - 1) * limitNum;

  const [countRows] = await pool.query(
    `SELECT COUNT(*) as count FROM listings l
     JOIN categories c ON c.id = l.category_id
     JOIN locations loc ON loc.id = l.location_id
     ${whereSql}`,
    params
  );
  const total = countRows[0].count;

  const [rows] = await pool.query(
    `${LISTING_BASE_SELECT} ${whereSql} ORDER BY ${orderSql} LIMIT :limit OFFSET :offset`,
    { ...params, limit: limitNum, offset }
  );

  const withImages = await attachImages(rows);

  res.json({
    listings: withImages.map(serializeListing),
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  });
});

// GET /api/listings/:id
export const getListing = asyncHandler(async (req, res) => {
  const listing = await findListingById(req.params.id);
  if (!listing) throw new ApiError(404, 'Listing not found');

  // Fire-and-forget view count bump — not critical if it's lost on error.
  pool.query('UPDATE listings SET view_count = view_count + 1 WHERE id = :id', { id: listing.id }).catch(() => {});

  res.json({ listing: serializeListing(listing) });
});

// POST /api/listings  (seller only)
export const createListing = asyncHandler(async (req, res) => {
  const b = req.body;
  if (!b.title || !b.categoryId || !b.locationId || b.priceETB == null) {
    throw new ApiError(400, 'title, categoryId, locationId and priceETB are required');
  }

  const [result] = await pool.query(
    `INSERT INTO listings (
      seller_id, category_id, location_id, title, title_am, description, description_am,
      price_etb, condition_type, is_negotiable, status
    ) VALUES (
      :sellerId, :categoryId, :locationId, :title, :titleAm, :description, :descriptionAm,
      :priceETB, :condition, :isNegotiable, 'active'
    )`,
    {
      sellerId: req.user.id,
      categoryId: b.categoryId,
      locationId: b.locationId,
      title: b.title,
      titleAm: b.titleAm ?? null,
      description: b.description ?? null,
      descriptionAm: b.descriptionAm ?? null,
      priceETB: b.priceETB,
      condition: b.condition ?? 'good',
      isNegotiable: b.isNegotiable ? 1 : 0,
    }
  );

  const listingId = result.insertId;

  if (Array.isArray(b.images) && b.images.length) {
    const values = b.images.map((url, i) => [listingId, url, i]);
    await pool.query('INSERT INTO listing_images (listing_id, url, sort_order) VALUES ?', [values]);
  }

  const listing = await findListingById(listingId);
  res.status(201).json({ listing: serializeListing(listing) });
});

// PUT /api/listings/:id  (owner seller or admin)
export const updateListing = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM listings WHERE id = :id', { id: req.params.id });
  const existing = rows[0];
  if (!existing) throw new ApiError(404, 'Listing not found');
  if (existing.seller_id !== req.user.id && req.user.role_id !== ROLES.ADMIN) {
    throw new ApiError(403, 'You can only edit your own listings');
  }

  const b = req.body;
  const fieldMap = {
    title: 'title', titleAm: 'title_am', description: 'description', descriptionAm: 'description_am',
    categoryId: 'category_id', locationId: 'location_id', priceETB: 'price_etb',
    condition: 'condition_type', isNegotiable: 'is_negotiable', status: 'status',
  };

  const sets = [];
  const params = { id: req.params.id };
  for (const [key, column] of Object.entries(fieldMap)) {
    if (b[key] !== undefined) {
      sets.push(`${column} = :${key}`);
      params[key] = key === 'isNegotiable' ? (b[key] ? 1 : 0) : b[key];
    }
  }
  if (!sets.length) throw new ApiError(400, 'No updatable fields provided');

  await pool.query(`UPDATE listings SET ${sets.join(', ')} WHERE id = :id`, params);

  if (Array.isArray(b.images)) {
    await pool.query('DELETE FROM listing_images WHERE listing_id = :id', { id: req.params.id });
    if (b.images.length) {
      const values = b.images.map((url, i) => [req.params.id, url, i]);
      await pool.query('INSERT INTO listing_images (listing_id, url, sort_order) VALUES ?', [values]);
    }
  }

  const listing = await findListingById(req.params.id);
  res.json({ listing: serializeListing(listing) });
});

// DELETE /api/listings/:id  (owner seller or admin)
export const deleteListing = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM listings WHERE id = :id', { id: req.params.id });
  const existing = rows[0];
  if (!existing) throw new ApiError(404, 'Listing not found');
  if (existing.seller_id !== req.user.id && req.user.role_id !== ROLES.ADMIN) {
    throw new ApiError(403, 'You can only delete your own listings');
  }

  await pool.query('DELETE FROM listings WHERE id = :id', { id: req.params.id });
  res.status(204).send();
});

// GET /api/sellers/me/listings  (seller's own listings, any status)
export const myListings = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `${LISTING_BASE_SELECT} WHERE l.seller_id = :sellerId ORDER BY l.created_at DESC`,
    { sellerId: req.user.id }
  );
  const withImages = await attachImages(rows);
  res.json({ listings: withImages.map(serializeListing) });
});
