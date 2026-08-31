import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from '../utils/jwt.js';
import { ROLES, ROLE_NAMES } from '../utils/roles.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toPublicUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    role: ROLE_NAMES[row.role_id],
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  };
}

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone, role = 'customer' } = req.body;

  if (!fullName || !email || !password) {
    throw new ApiError(400, 'fullName, email and password are required');
  }
  if (!EMAIL_RE.test(email)) throw new ApiError(400, 'Please provide a valid email address');
  if (password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters');

  // Only customer/seller may be chosen at signup — admin accounts are
  // never created through the public API.
  const roleId = role === 'seller' ? ROLES.SELLER : ROLES.CUSTOMER;

  const [existing] = await pool.query('SELECT id FROM users WHERE email = :email', {
    email: email.toLowerCase(),
  });
  if (existing[0]) throw new ApiError(409, 'An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    `INSERT INTO users (role_id, full_name, email, phone, password_hash)
     VALUES (:roleId, :fullName, :email, :phone, :passwordHash)`,
    { roleId, fullName, email: email.toLowerCase(), phone: phone ?? null, passwordHash }
  );

  const userId = result.insertId;

  if (roleId === ROLES.SELLER) {
    await pool.query(
      `INSERT INTO seller_profiles (user_id, store_name) VALUES (:userId, :storeName)`,
      { userId, storeName: fullName }
    );
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE id = :id', { id: userId });
  const token = signToken({ sub: userId, role: ROLE_NAMES[roleId] });

  res.status(201).json({ user: toPublicUser(rows[0]), token });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'email and password are required');

  const [rows] = await pool.query('SELECT * FROM users WHERE email = :email', {
    email: email.toLowerCase(),
  });
  const user = rows[0];
  if (!user) throw new ApiError(401, 'Invalid email or password');
  if (!user.is_active) throw new ApiError(403, 'This account has been deactivated');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new ApiError(401, 'Invalid email or password');

  const token = signToken({ sub: user.id, role: ROLE_NAMES[user.role_id] });
  res.json({ user: toPublicUser(user), token });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: toPublicUser(req.user) });
});

export { toPublicUser };
