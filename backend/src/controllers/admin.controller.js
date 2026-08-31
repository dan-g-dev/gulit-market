import pool from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLE_NAMES, ROLES } from '../utils/roles.js';
import { LISTING_BASE_SELECT, attachImages } from '../models/listingModel.js';
import { serializeListing } from '../utils/serializeListing.js';

// GET /api/admin/reports — basic marketplace counts
export const getReports = asyncHandler(async (req, res) => {
  const [[userCount]] = await pool.query('SELECT COUNT(*) as count FROM users');
  const [[sellerCount]] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role_id = :id', {
    id: ROLES.SELLER,
  });
  const [[listingCount]] = await pool.query('SELECT COUNT(*) as count FROM listings');
  const [[activeListingCount]] = await pool.query(
    "SELECT COUNT(*) as count FROM listings WHERE status = 'active'"
  );
  const [[orderCount]] = await pool.query('SELECT COUNT(*) as count FROM orders');
  const [[revenue]] = await pool.query(
    "SELECT COALESCE(SUM(total_etb), 0) as total FROM orders WHERE payment_status = 'paid'"
  );

  res.json({
    totalUsers: userCount.count,
    totalSellers: sellerCount.count,
    totalListings: listingCount.count,
    activeListings: activeListingCount.count,
    totalOrders: orderCount.count,
    paidRevenueETB: Number(revenue.total),
  });
});

// GET /api/admin/users
export const listUsers = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, role_id, full_name, email, phone, is_active, created_at FROM users ORDER BY created_at DESC'
  );
  res.json({
    users: rows.map((u) => ({
      id: u.id,
      role: ROLE_NAMES[u.role_id],
      fullName: u.full_name,
      email: u.email,
      phone: u.phone,
      isActive: !!u.is_active,
      createdAt: u.created_at,
    })),
  });
});

// PUT /api/admin/users/:id  { isActive?, role? }
export const updateUser = asyncHandler(async (req, res) => {
  const { isActive, role } = req.body;
  const sets = [];
  const params = { id: req.params.id };

  if (isActive !== undefined) {
    sets.push('is_active = :isActive');
    params.isActive = isActive ? 1 : 0;
  }
  if (role !== undefined) {
    const roleId = Object.entries(ROLE_NAMES).find(([, name]) => name === role)?.[0];
    if (!roleId) throw new ApiError(400, 'Invalid role');
    sets.push('role_id = :roleId');
    params.roleId = roleId;
  }
  if (!sets.length) throw new ApiError(400, 'No updatable fields provided');

  const [result] = await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = :id`, params);
  if (!result.affectedRows) throw new ApiError(404, 'User not found');

  res.json({ updated: true });
});

// GET /api/admin/listings — every listing, any status
export const listAllListings = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`${LISTING_BASE_SELECT} ORDER BY l.created_at DESC LIMIT 200`);
  const withImages = await attachImages(rows);
  res.json({ listings: withImages.map(serializeListing) });
});

// PUT /api/admin/listings/:id  { status?, isFeatured? }
export const moderateListing = asyncHandler(async (req, res) => {
  const { status, isFeatured } = req.body;
  const sets = [];
  const params = { id: req.params.id };

  if (status !== undefined) { sets.push('status = :status'); params.status = status; }
  if (isFeatured !== undefined) { sets.push('is_featured = :isFeatured'); params.isFeatured = isFeatured ? 1 : 0; }
  if (!sets.length) throw new ApiError(400, 'No updatable fields provided');

  const [result] = await pool.query(`UPDATE listings SET ${sets.join(', ')} WHERE id = :id`, params);
  if (!result.affectedRows) throw new ApiError(404, 'Listing not found');

  res.json({ updated: true });
});

// GET /api/admin/orders
export const listAllOrders = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 200');
  res.json({
    orders: rows.map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      status: o.status,
      totalETB: Number(o.total_etb),
      paymentProvider: o.payment_provider,
      paymentStatus: o.payment_status,
      createdAt: o.created_at,
    })),
  });
});
