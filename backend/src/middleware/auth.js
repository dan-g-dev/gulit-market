import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import pool from '../config/db.js';

// Requires a valid Bearer token; attaches the authenticated user to req.user.
// Role/authorization checks always re-read the role from the database — the
// JWT's role claim is only used to look the user up quickly, never trusted
// on its own for authorization decisions.
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return next(new ApiError(401, 'Authentication required'));

  try {
    const payload = verifyToken(token);
    const [rows] = await pool.query(
      'SELECT id, role_id, full_name, email, phone, avatar_url, is_active FROM users WHERE id = :id',
      { id: payload.sub }
    );
    const user = rows[0];
    if (!user) return next(new ApiError(401, 'User no longer exists'));
    if (!user.is_active) return next(new ApiError(403, 'This account has been deactivated'));
    req.user = user;
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
}

// Attaches req.user if a valid token is present, but doesn't fail otherwise.
export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  try {
    const payload = verifyToken(token);
    const [rows] = await pool.query(
      'SELECT id, role_id, full_name, email, phone, avatar_url, is_active FROM users WHERE id = :id',
      { id: payload.sub }
    );
    if (rows[0]) req.user = rows[0];
  } catch {
    // ignore invalid token in optional mode
  }
  next();
}

// Restricts a route to one or more role IDs, e.g. requireRole(ROLES.SELLER, ROLES.ADMIN)
export function requireRole(...roleIds) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Authentication required'));
    if (!roleIds.includes(req.user.role_id)) {
      return next(new ApiError(403, 'You do not have permission to do this'));
    }
    next();
  };
}
