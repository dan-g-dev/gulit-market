import pool from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { LISTING_BASE_SELECT, attachImages } from '../models/listingModel.js';
import { serializeListing } from '../utils/serializeListing.js';

function serializeSellerProfile(row) {
  return {
    userId: row.user_id,
    storeName: row.store_name,
    storeNameAm: row.store_name_am,
    bio: row.bio,
    bioAm: row.bio_am,
    coverImageUrl: row.cover_image_url,
    isVerified: !!row.is_verified,
    rating: Number(row.rating),
    reviewCount: row.review_count,
  };
}

// GET /api/sellers/:id — public storefront
export const getSellerProfile = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT sp.*, u.full_name FROM seller_profiles sp
     JOIN users u ON u.id = sp.user_id WHERE sp.user_id = :id`,
    { id: req.params.id }
  );
  const profile = rows[0];
  if (!profile) throw new ApiError(404, 'Seller not found');

  const [listingRows] = await pool.query(
    `${LISTING_BASE_SELECT} WHERE l.seller_id = :sellerId AND l.status = 'active' ORDER BY l.created_at DESC`,
    { sellerId: req.params.id }
  );
  const withImages = await attachImages(listingRows);

  res.json({
    seller: serializeSellerProfile(profile),
    listings: withImages.map(serializeListing),
  });
});

// GET /api/sellers/me — the logged-in seller's own profile
export const getMyProfile = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM seller_profiles WHERE user_id = :id', {
    id: req.user.id,
  });
  if (!rows[0]) throw new ApiError(404, 'Seller profile not found');
  res.json({ seller: serializeSellerProfile(rows[0]) });
});

// PUT /api/sellers/me — update store profile
export const updateMyProfile = asyncHandler(async (req, res) => {
  const { storeName, storeNameAm, bio, bioAm, coverImageUrl, locationId } = req.body;

  const sets = [];
  const params = { userId: req.user.id };
  if (storeName !== undefined) { sets.push('store_name = :storeName'); params.storeName = storeName; }
  if (storeNameAm !== undefined) { sets.push('store_name_am = :storeNameAm'); params.storeNameAm = storeNameAm; }
  if (bio !== undefined) { sets.push('bio = :bio'); params.bio = bio; }
  if (bioAm !== undefined) { sets.push('bio_am = :bioAm'); params.bioAm = bioAm; }
  if (coverImageUrl !== undefined) { sets.push('cover_image_url = :coverImageUrl'); params.coverImageUrl = coverImageUrl; }
  if (locationId !== undefined) { sets.push('location_id = :locationId'); params.locationId = locationId; }

  if (!sets.length) throw new ApiError(400, 'No updatable fields provided');

  await pool.query(`UPDATE seller_profiles SET ${sets.join(', ')} WHERE user_id = :userId`, params);

  const [rows] = await pool.query('SELECT * FROM seller_profiles WHERE user_id = :id', {
    id: req.user.id,
  });
  res.json({ seller: serializeSellerProfile(rows[0]) });
});

// GET /api/sellers/me/orders — orders containing at least one of this seller's listings
export const getMyOrders = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT DISTINCT o.* FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     WHERE oi.seller_id = :sellerId ORDER BY o.created_at DESC`,
    { sellerId: req.user.id }
  );
  res.json({
    orders: rows.map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      status: o.status,
      totalETB: Number(o.total_etb),
      paymentStatus: o.payment_status,
      createdAt: o.created_at,
    })),
  });
});
