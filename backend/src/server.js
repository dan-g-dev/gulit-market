import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

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

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

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
