// Mirrors the `roles` table (see database/schema.sql). Role IDs are fixed
// and seeded once, so it's safe to hardcode them here.
export const ROLES = {
  CUSTOMER: 1,
  SELLER: 2,
  ADMIN: 3,
};

export const ROLE_NAMES = {
  1: 'customer',
  2: 'seller',
  3: 'admin',
};
