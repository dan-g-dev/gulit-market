-- ============================================================
-- Gulit Market — PRODUCTION sellers file
-- Matches the REAL production schema exactly (confirmed via
-- fresh DESCRIBE after rebuilding from schema.sql):
--   - users.role_id (int, FK to roles — 2 = seller)
--   - seller_profiles.bio / rating / review_count
--   - categories/locations match the ORIGINAL numbering
--     (Electronics=1 ... Habesha Kemis=40, Ethiopia=1 country,
--     Addis Ababa=2 city, districts 10-17)
-- NOTE: this is DIFFERENT from your local database's schema,
-- which has since drifted (role ENUM, price, slug, image_url,
-- different category numbering). That drift should be looked
-- at separately — local no longer matches what's in your repo's
-- committed schema.sql.
-- ============================================================

SET NAMES utf8mb4;

INSERT INTO users (id, role_id, full_name, email, phone, password_hash, is_active) VALUES
  (30, 2, 'Lalibela Heritage Couture', 'seller30@example.com', '+251911000030', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 1),
  (31, 2, 'Addis Modern Tibeb', 'seller31@example.com', '+251911000031', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 1),
  (32, 2, 'Habesha Men Fashion House', 'seller32@example.com', '+251911000032', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 1),
  (33, 2, 'Lijoch Habesha Wardrobe', 'seller33@example.com', '+251911000033', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 1),
  (34, 2, 'Kongaye Farmers Union', 'seller34@example.com', '+251911000034', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 1),
  (35, 2, 'Wolleka Pottery Guild', 'seller35@example.com', '+251911000035', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 1),
  (36, 2, 'Entoto Woodcraft Guild', 'seller36@example.com', '+251911000036', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 1),
  (37, 2, 'Sheger Leather Craftsmen', 'seller37@example.com', '+251911000037', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 1),
  (38, 2, 'Walia Botanicals', 'seller38@example.com', '+251911000038', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 1),
  (39, 2, 'Zemen Real Estate', 'seller39@example.com', '+251911000039', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 1),
  (40, 2, 'Bole Atlas Ethio Motors', 'seller40@example.com', '+251911000040', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 1),
  (41, 2, 'Kazanchis Tech Plaza', 'seller41@example.com', '+251911000041', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 1);

INSERT INTO seller_profiles (user_id, store_name, bio, location_id, is_verified, rating, review_count) VALUES
  (30, 'Lalibela Heritage Couture', 'Handwoven Habesha Kemis inspired by Lalibela\'s rock-hewn crosses, woven in Addis Ababa.', 13, 1, 4.9, 71),
  (31, 'Addis Modern Tibeb', 'Modern silhouettes meet traditional tibeb embroidery, based in Bole.', 10, 1, 4.8, 54),
  (32, 'Habesha Men Fashion House', 'Menswear specialists focused on traditional Kidan shirt and trouser sets.', 12, 1, 4.9, 46),
  (33, 'Lijoch Habesha Wardrobe', 'Children\'s traditional wear for Timket and holiday celebrations.', 10, 1, 5.0, 38),
  (34, 'Kongaye Farmers Union', 'Smallholder coffee farmer cooperative from the Yirgacheffe highlands.', 2, 1, 4.9, 148),
  (35, 'Wolleka Pottery Guild', 'Traditional pit-fired black clay pottery from Gondar, sold via our Addis Ababa outlet.', 6, 1, 4.9, 88),
  (36, 'Entoto Woodcraft Guild', 'Hand-carved wanza wood furniture and coffee ceremony sets from Entoto.', 2, 1, 4.9, 65),
  (37, 'Sheger Leather Craftsmen', 'Full-grain Ethiopian leather goods, vegetable-tanned and hand-stitched.', 2, 1, 4.9, 54),
  (38, 'Walia Botanicals', 'Natural skincare and haircare made with Ethiopian botanicals.', 13, 1, 5.0, 64),
  (39, 'Zemen Real Estate', 'Residential property listings across Addis Ababa.', 10, 1, 4.9, 14),
  (40, 'Bole Atlas Ethio Motors', 'New and certified pre-owned vehicles, based in Bole Atlas.', 10, 1, 5.0, 11),
  (41, 'Kazanchis Tech Plaza', 'Phones, laptops, and electronics retailer in Kazanchis.', 12, 1, 4.9, 39);