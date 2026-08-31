# Gulit Market ጉሊት ገበያ

Ethiopia's premier modern marketplace for fashion, handwoven Habesha Kemis,
specialty coffee, artisanal home crafts, vehicles, and property.

## Structure

```
frontend/    React + Vite + TypeScript client — now wired to the backend API
backend/     Node.js + Express + MySQL API
database/    schema.sql, seed.sql
```

See `backend/README.md` for the full API reference and `LEARNING_GUIDE.md`
for a walkthrough of how the backend is put together.

## Run locally

**1. Database**

Requires MySQL 8+ running locally.

```bash
mysql -u root -e "CREATE DATABASE gulit_market CHARACTER SET utf8mb4;"
mysql -u root -e "CREATE USER 'gulit'@'localhost' IDENTIFIED BY 'your_password'; \
  GRANT ALL PRIVILEGES ON gulit_market.* TO 'gulit'@'localhost';"
```

**2. Backend**

```bash
cd backend
npm install
cp .env.example .env      # fill in your DB credentials
npm run db:migrate         # applies database/schema.sql
npm run db:seed            # applies database/seed.sql (sample data + demo accounts)
npm run dev                 # http://localhost:4000
```

Demo accounts (password `password123`): `buyer@example.com` (customer),
`seller@example.com` (seller), `admin@example.com` (admin).

**3. Frontend**

```bash
cd frontend
npm install
cp .env.example .env.local   # points VITE_API_URL at the backend, defaults to localhost:4000
npm run dev                   # http://localhost:3000
```

## What's wired up

- **Browsing** — the storefront now fetches real listings from
  `GET /api/listings` on load (with a static-data fallback and a visible
  banner if the API is unreachable).
- **Auth** — a sign-in/register modal (top-right account bar) creates a real
  account and JWT session; adding to cart/wishlist prompts sign-in if you're
  not logged in.
- **Cart & wishlist** — persisted server-side per user via `/api/cart` and
  `/api/wishlist`.
- **Checkout** — the existing multi-step checkout UI now calls
  `POST /api/orders` for real. Cash on Delivery works end-to-end; TeleBirr
  honestly surfaces the backend's "not configured" error instead of faking
  success; CBE Birr / Card are shown but disabled ("Coming Soon") since
  they aren't implemented on the backend.
- **Seller Dashboard** — reachable from the account bar once signed in as a
  seller: overview stats, listings (create/toggle status/delete), orders
  (advance status), offers (accept/reject), store profile.
- **Admin Dashboard** — reachable as an admin: marketplace-wide reports,
  user management (activate/deactivate), listing moderation
  (feature/status), all orders, category management.

Verified end-to-end against a live MySQL + Express backend: register → browse
→ add to cart → checkout (COD) → order created with server-computed totals.

## Known limitations

- The Ceremony Kit Builder and Custom Kemis Tailoring flows still add items
  to the (now-real) cart, but their special "kit"/"custom measurements"
  concept isn't modeled on the backend — the note is attached client-side
  for display only.
- No self-service "become a seller" upgrade for an existing customer
  account (an admin can change a user's role from the Admin Dashboard).
- No image upload — listing images are plain URL strings.
- Delivery fee is a flat rate, not distance-based.
