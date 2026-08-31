# Gulit Market — Backend API

Node.js + Express + MySQL backend for Gulit Market ጉሊት ገበያ.

## Features implemented

- **Auth** — register/login (customer or seller), JWT sessions, bcrypt password hashing. Role is always re-read from the database on every request — never trusted from the JWT alone or from client input.
- **Categories & locations** — hierarchical (category → subcategory, country → city → district), seeded with realistic Ethiopian data.
- **Listings** — full-text search (`MATCH ... AGAINST`), filter by category/location/price/condition, sort, paginate. Seller CRUD on their own listings, with images.
- **Wishlist** — add/remove/list favorites.
- **Cart** — persisted per-user cart with quantities.
- **Orders** — checkout from cart; server recomputes totals from the DB (never trusts client-sent prices); order-status lifecycle (`pending → confirmed → processing → shipped → delivered`, or `cancelled`); sellers can update the status of orders containing their items.
- **Reviews** — restricted to buyers who actually received a `delivered` order containing that listing.
- **Offers** — buyers can offer on negotiable listings; sellers accept/reject/counter.
- **Seller profiles** — public storefront page, seller's own dashboard endpoints (profile, listings, orders).
- **Admin** — reports/counts, user management (activate/deactivate, change role), listing moderation (status/featured), category management, order oversight.
- **Payments** — a small provider abstraction (`PaymentService → provider → initiate → verify`) with two providers:
  - **Cash on Delivery** — always available, no external API needed.
  - **TeleBirr** — **honestly unconfigured**. Without real merchant credentials in `.env`, it returns a clear `501 "TeleBirr is ready for configuration"` instead of faking a successful payment. See `src/services/payments/telebirrProvider.js` for exactly what to implement once you have credentials.

## Run locally

**Prerequisites:** Node.js 18+, MySQL 8+

```bash
npm install
cp .env.example .env
# edit .env with your MySQL credentials if different from the defaults

npm run db:migrate   # applies database/schema.sql
npm run db:seed      # applies database/seed.sql (sample data + demo accounts)
npm run dev           # http://localhost:4000
```

Demo accounts (password for all: `password123`):

| Role     | Email                 |
|----------|-----------------------|
| Customer | buyer@example.com     |
| Seller   | seller@example.com    |
| Admin    | admin@example.com     |

## API overview

All endpoints are under `/api`. Authenticated routes expect `Authorization: Bearer <token>`.

| Method | Path                              | Auth          | Description                              |
|--------|------------------------------------|---------------|-------------------------------------------|
| GET    | /health                            | —             | Health check                               |
| POST   | /auth/register                     | —             | Create a customer or seller account        |
| POST   | /auth/login                        | —             | Log in, returns a JWT                      |
| GET    | /auth/me                           | required      | Current user                               |
| GET    | /categories                        | —             | Category tree                              |
| GET    | /locations                         | —             | Location tree                              |
| GET    | /listings                          | —             | Search/filter/paginate listings            |
| GET    | /search                            | —             | Same as /listings (search-bar alias)       |
| GET    | /listings/:id                      | —             | Listing detail                             |
| POST   | /listings                          | seller        | Create a listing                           |
| PUT    | /listings/:id                      | owner         | Update a listing                           |
| DELETE | /listings/:id                      | owner         | Delete a listing                           |
| GET    | /listings/:id/reviews              | —             | Reviews for a listing                      |
| POST   | /listings/:id/reviews              | required      | Review a delivered order's listing         |
| GET    | /wishlist                          | required      | Current user's wishlist                    |
| POST   | /wishlist                          | required      | Add to wishlist                            |
| DELETE | /wishlist/:listingId               | required      | Remove from wishlist                       |
| GET    | /cart                              | required      | Current user's cart                        |
| POST   | /cart/items                        | required      | Add an item                                |
| PUT    | /cart/items/:cartItemId            | required      | Update quantity                            |
| DELETE | /cart/items/:cartItemId            | required      | Remove an item                             |
| DELETE | /cart                              | required      | Clear the cart                             |
| POST   | /orders                            | required      | Checkout — creates order from cart         |
| GET    | /orders                            | required      | Current user's orders (as buyer)           |
| GET    | /orders/:id                        | buyer/seller/admin | Order detail                          |
| PUT    | /orders/:id/status                 | seller/admin  | Advance order status                       |
| POST   | /offers                            | required      | Make an offer on a negotiable listing      |
| GET    | /offers                            | required      | Offers you made or received                |
| PUT    | /offers/:id                        | seller        | Accept / reject / counter an offer         |
| GET    | /sellers/:id                       | —             | Public storefront                          |
| GET    | /sellers/me                        | seller        | Your own store profile                     |
| PUT    | /sellers/me                        | seller        | Update your store profile                  |
| GET    | /sellers/me/listings               | seller        | Your listings (any status)                 |
| GET    | /sellers/me/orders                 | seller        | Orders containing your listings            |
| GET    | /payments/providers                | —             | Which payment methods are usable right now |
| POST   | /payments/:orderId/verify          | required      | Re-check payment status with the provider  |
| GET    | /admin/reports                     | admin         | Marketplace-wide counts                    |
| GET    | /admin/users                       | admin         | All users                                  |
| PUT    | /admin/users/:id                   | admin         | Activate/deactivate, change role           |
| GET    | /admin/listings                    | admin         | All listings, any status                   |
| PUT    | /admin/listings/:id                | admin         | Moderate (status / featured)               |
| GET    | /admin/orders                      | admin         | All orders                                 |
| POST   | /admin/categories                  | admin         | Create a category                          |
| DELETE | /admin/categories/:id              | admin         | Delete a category                          |

## Project structure

```
src/
  server.js              entry point — wires up middleware & routes
  config/
    db.js                 MySQL connection pool
    migrate.js             applies database/schema.sql
    seed.js                 applies database/seed.sql
  routes/                 one Express router per resource
  controllers/             route handlers / business logic
  models/
    listingModel.js         shared "listing + images + seller" query, reused
                             by search, cart, orders, offers, wishlist
  services/
    paymentService.js       provider lookup/registry
    payments/
      cashOnDeliveryProvider.js
      telebirrProvider.js    honest "not configured" until real credentials exist
  middleware/
    auth.js                  JWT auth + role checks (role always re-read from DB)
    errorHandler.js
  utils/                    JWT signing, ApiError, serializers, IDs
```

## Security notes

- Passwords are hashed with bcrypt (10 rounds); plaintext is never stored or logged.
- All SQL uses parameterized queries (`mysql2` named placeholders) — no string-concatenated SQL.
- Authorization is enforced server-side on every protected route; the frontend's claimed role is never trusted.
- `.env` is git-ignored; only `.env.example` (no real secrets) is committed.
- 500-level errors are logged server-side but never leak internals (stack traces, SQL, etc.) to the client.

## Known limitations

- **TeleBirr is not live.** It's architecturally ready (see `telebirrProvider.js`) but requires real merchant credentials Anthropic/this environment does not have. Do not present it as "integrated" — it isn't, by design, until credentials are added.
- Delivery fee is a flat rate (150 ETB) rather than distance/weight-based — noted as a `TODO` in `orders.controller.js` if you want to make it smarter later.
- No image upload endpoint yet — `images` on a listing are plain URL strings (the frontend/seller supplies the URL, e.g. from an existing CDN or the placeholder image set).
