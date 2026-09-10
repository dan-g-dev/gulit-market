import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import locationsRoutes from './routes/locations.routes.js';
import listingsRoutes from './routes/listings.routes.js';
import searchRoutes from './routes/search.routes.js';
import cartRoutes from './routes/cart.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import offersRoutes from './routes/offers.routes.js';
import sellersRoutes from './routes/sellers.routes.js';
import adminRoutes from './routes/admin.routes.js';
import paymentsRoutes from './routes/payments.routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// ES modules don't have __dirname built in, so it's derived from
// import.meta.url instead — needed below to serve static images.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Serves product images from backend/public/placeholder-images/*
// at https://<this-api>/placeholder-images/*, matching the paths
// stored in listing_images.url (e.g. "/placeholder-images/x.jpg").
app.use('/placeholder-images', express.static(path.join(__dirname, '..', 'public', 'placeholder-images')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/listings', listingsRoutes);
// Reviews are nested under a listing: /api/listings/:listingId/reviews
app.use('/api/listings/:listingId/reviews', reviewsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/sellers', sellersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Gulit Market API listening on http://localhost:${PORT}`);
});
