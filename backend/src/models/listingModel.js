// Shared listing queries used by several controllers (search, cart, orders,
// offers, reviews, wishlist) so the "listing + first image + seller store
// name" join logic lives in one place.
import pool from '../config/db.js';

const BASE_SELECT = `
  SELECT
    l.*,
    c.name AS category_name, c.slug AS category_slug,
    loc.name AS location_name, loc.name_am AS location_name_am,
    sp.store_name, sp.store_name_am, sp.is_verified AS seller_verified, sp.rating AS seller_rating,
    u.full_name AS seller_full_name
  FROM listings l
  JOIN categories c ON c.id = l.category_id
  JOIN locations loc ON loc.id = l.location_id
  JOIN users u ON u.id = l.seller_id
  LEFT JOIN seller_profiles sp ON sp.user_id = l.seller_id
`;

export async function findListingById(id) {
  const [rows] = await pool.query(`${BASE_SELECT} WHERE l.id = :id`, { id });
  if (!rows[0]) return null;

  const [images] = await pool.query(
    'SELECT url FROM listing_images WHERE listing_id = :id ORDER BY sort_order ASC',
    { id }
  );
  return { ...rows[0], images: images.map((r) => r.url) };
}

export async function attachImages(listings) {
  if (!listings.length) return listings;
  const ids = listings.map((l) => l.id);
  const [images] = await pool.query(
    `SELECT listing_id, url FROM listing_images WHERE listing_id IN (${ids.map(() => '?').join(',')}) ORDER BY sort_order ASC`,
    ids
  );
  const byListing = {};
  for (const img of images) {
    (byListing[img.listing_id] ||= []).push(img.url);
  }
  return listings.map((l) => ({ ...l, images: byListing[l.id] || [] }));
}

export { BASE_SELECT as LISTING_BASE_SELECT };
