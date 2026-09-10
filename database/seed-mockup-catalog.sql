-- ============================================================
-- Gulit Market — additional sellers + listings
-- Rewritten to match your ACTUAL current schema (checked live
-- via DESCRIBE users / seller_profiles / listings / listing_images):
--   - users.role is a direct ENUM, no roles table
--   - seller_profiles uses store_slug, about, rating_avg, rating_count
--   - listings uses slug, price (not price_etb), condition_type
--     ENUM('new','used','refurbished'), status ENUM('active','sold',
--     'paused','removed'), and its OWN rating_avg/rating_count columns
--   - listing_images uses image_url (not url)
--
-- Since listings genuinely have their own rating_avg/rating_count
-- columns (not derived from real orders/reviews), realistic-looking
-- ratings ARE included below — these are still fabricated demo
-- numbers, not real reviews, but the schema supports storing them
-- directly.
--
-- Safe to run on its own: fresh user IDs (30+) and listing IDs
-- (100+), won't collide with existing data.
-- Passwords for all these new demo sellers: password123
-- ============================================================

SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- new seller accounts
-- ------------------------------------------------------------
INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active) VALUES
  (30, 'Lalibela Heritage Couture', 'seller30@example.com', '+251911000030', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 'seller', 1),
  (31, 'Addis Modern Tibeb', 'seller31@example.com', '+251911000031', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 'seller', 1),
  (32, 'Habesha Men Fashion House', 'seller32@example.com', '+251911000032', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 'seller', 1),
  (33, 'Lijoch Habesha Wardrobe', 'seller33@example.com', '+251911000033', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 'seller', 1),
  (34, 'Kongaye Farmers Union', 'seller34@example.com', '+251911000034', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 'seller', 1),
  (35, 'Wolleka Pottery Guild', 'seller35@example.com', '+251911000035', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 'seller', 1),
  (36, 'Entoto Woodcraft Guild', 'seller36@example.com', '+251911000036', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 'seller', 1),
  (37, 'Sheger Leather Craftsmen', 'seller37@example.com', '+251911000037', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 'seller', 1),
  (38, 'Walia Botanicals', 'seller38@example.com', '+251911000038', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 'seller', 1),
  (39, 'Zemen Real Estate', 'seller39@example.com', '+251911000039', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 'seller', 1),
  (40, 'Bole Atlas Ethio Motors', 'seller40@example.com', '+251911000040', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 'seller', 1),
  (41, 'Kazanchis Tech Plaza', 'seller41@example.com', '+251911000041', '$2a$10$yGA73QMI6QS.pu68pjutx.UjXGa6i31fGB5.Lv1ZFGq3GZLRcKh1W', 'seller', 1);

-- ------------------------------------------------------------
-- seller profiles
-- ------------------------------------------------------------
INSERT INTO seller_profiles (user_id, store_name, store_slug, about, location_id, is_verified, rating_avg, rating_count) VALUES
  (30, 'Lalibela Heritage Couture', 'lalibela-heritage-couture', 'Handwoven Habesha Kemis inspired by Lalibela\'s rock-hewn crosses, woven in Piassa.', 13, 1, 4.90, 71),
  (31, 'Addis Modern Tibeb', 'addis-modern-tibeb', 'Modern silhouettes meet traditional tibeb embroidery, based in Bole.', 10, 1, 4.80, 54),
  (32, 'Habesha Men Fashion House', 'habesha-men-fashion-house', 'Menswear specialists focused on traditional Kidan shirt and trouser sets.', 12, 1, 4.90, 46),
  (33, 'Lijoch Habesha Wardrobe', 'lijoch-habesha-wardrobe', 'Children\'s traditional wear for Timket and holiday celebrations.', 10, 1, 5.00, 38),
  (34, 'Kongaye Farmers Union', 'kongaye-farmers-union', 'Smallholder coffee farmer cooperative from the Yirgacheffe highlands.', 2, 1, 4.90, 148),
  (35, 'Wolleka Pottery Guild', 'wolleka-pottery-guild', 'Traditional pit-fired black clay pottery from Gondar, sold via our Addis Ababa outlet.', 6, 1, 4.90, 88),
  (36, 'Entoto Woodcraft Guild', 'entoto-woodcraft-guild', 'Hand-carved wanza wood furniture and coffee ceremony sets from Entoto.', 2, 1, 4.90, 65),
  (37, 'Sheger Leather Craftsmen', 'sheger-leather-craftsmen', 'Full-grain Ethiopian leather goods, vegetable-tanned and hand-stitched.', 2, 1, 4.90, 54),
  (38, 'Walia Botanicals', 'walia-botanicals', 'Natural skincare and haircare made with Ethiopian botanicals.', 13, 1, 5.00, 64),
  (39, 'Zemen Real Estate', 'zemen-real-estate', 'Residential property listings across Addis Ababa.', 10, 1, 4.90, 14),
  (40, 'Bole Atlas Ethio Motors', 'bole-atlas-ethio-motors', 'New and certified pre-owned vehicles, based in Bole Atlas.', 10, 1, 5.00, 11),
  (41, 'Kazanchis Tech Plaza', 'kazanchis-tech-plaza', 'Phones, laptops, and electronics retailer in Kazanchis.', 12, 1, 4.90, 39);

-- ------------------------------------------------------------
-- new listings
-- condition_type only allows: 'new', 'used', 'refurbished'
-- status only allows: 'active', 'sold', 'paused', 'removed'
-- ------------------------------------------------------------
INSERT INTO listings (id, seller_id, category_id, location_id, title, slug, description, price, condition_type, is_negotiable, is_featured, status, rating_avg, rating_count) VALUES
  (100, 30, 40, 13, 'Handwoven Lalibela White & Burgundy Cross Habesha Kemis', 'handwoven-lalibela-white-burgundy-cross-habesha-kemis',
   'Double-ply cotton with a Lalibela rock-cross pattern woven along the hem, modern silhouette.',
   23000.00, 'new', 1, 1, 'active', 4.90, 71),
  (101, 31, 40, 10, 'Modern Teal & Gold Floral Embroidered Habesha Dress', 'modern-teal-gold-floral-embroidered-habesha-dress',
   'Lightweight Menen fabric, tailored A-line cut, free-size with matching belt.',
   9500.00, 'new', 1, 0, 'active', 4.80, 54),
  (102, 32, 40, 12, 'Men\'s Traditional Tibeb Embroidered Shirt & Trouser Set', 'mens-traditional-tibeb-embroidered-shirt-trouser-set',
   'Hand-spun Menen fabric with gold and emerald green collar tibeb, modern fit.',
   8500.00, 'new', 1, 1, 'active', 4.90, 46),
  (103, 33, 40, 10, 'Children\'s Timket & Holiday Habesha Kemis & Vest Ensemble', 'childrens-timket-holiday-habesha-kemis-vest-ensemble',
   'Soft, non-itch pure cotton with vibrant red and gold tibeb trim, sized for kids.',
   4500.00, 'new', 1, 1, 'active', 5.00, 38),
  (104, 34, 8, 2, 'Yirgacheffe Single-Origin Grade 1 Washed Coffee (500g)', 'yirgacheffe-single-origin-grade-1-washed-coffee-500g',
   'Jasmine floral notes with bergamot citrus, sun-dried on African raised beds.',
   1250.00, 'new', 0, 0, 'active', 4.90, 148),
  (105, 35, 6, 6, 'Handmade Gondar Black Clay Jebena with Straw Ring Base', 'handmade-gondar-black-clay-jebena-with-straw-ring-base',
   'Pit-fired mineral clay with a spherical brew chamber, authentic coffee ceremony piece.',
   1850.00, 'new', 1, 0, 'active', 4.90, 88),
  (106, 36, 6, 2, 'Handcrafted Wanza Wood Rekebot with 6 Gold-Rimmed Sini Cups', 'handcrafted-wanza-wood-rekebot-with-6-gold-rimmed-sini-cups',
   'Solid hardwood tray with brass cross inlay and a built-in incense drawer.',
   6200.00, 'new', 1, 0, 'active', 4.90, 65),
  (107, 34, 15, 2, 'Magna White Teff (100kg Grain Sack, Cleaned & Sifted)', 'magna-white-teff-100kg-grain-sack-cleaned-sifted',
   'Direct from Ada (Bishoftu) and Gojjam farms, high iron, superfine injera quality.',
   12800.00, 'new', 1, 0, 'active', 5.00, 63),
  (108, 34, 8, 2, 'Gojjam Sun-Dried Artisanal Berbere Spice Blend (1kg Pouch)', 'gojjam-sun-dried-artisanal-berbere-spice-blend-1kg-pouch',
   'Sun-cured chili peppers stone-ground with 16 mountain spices and korerima.',
   1800.00, 'new', 0, 0, 'active', 4.90, 164),
  (109, 37, 43, 2, 'Modjo Full-Grain Ethiopian Leather Messenger & Laptop Bag', 'modjo-full-grain-ethiopian-leather-messenger-laptop-bag',
   'Vegetable-tanned highland cowhide with a dedicated 16-inch laptop compartment.',
   8800.00, 'new', 1, 0, 'active', 4.90, 54),
  (110, 36, 6, 9, 'Hand-Carved Jimma Solid Wanza Wood Coffee Table & 2 Stools', 'hand-carved-jimma-solid-wanza-wood-coffee-table-2-stools',
   'Single solid block carving with a traditional flared rim and natural beeswax polish.',
   18500.00, 'new', 1, 0, 'active', 5.00, 27),
  (111, 37, 42, 2, 'Handmade Ethiopian Leather Chelsea Boots (Cognac Brown)', 'handmade-ethiopian-leather-chelsea-boots-cognac-brown',
   'Full-grain calf leather, Goodyear welted crepe sole, sizes EU 40-45.',
   5400.00, 'new', 1, 0, 'active', 5.00, 42),
  (112, 38, 9, 13, 'Organic Black Seed & Korerima Hair Elixir', 'organic-black-seed-korerima-hair-elixir',
   'Cold-pressed nigella sativa oil blended with korerima, promotes hair growth and skin glow.',
   980.00, 'new', 0, 0, 'active', 5.00, 64),
  (113, 39, 4, 10, 'Luxury 3-Bedroom Apartment in Bole Atlas (165 sqm)', 'luxury-3-bedroom-apartment-in-bole-atlas-165-sqm',
   'High floor with city view, standby generator, dedicated underground parking.',
   18500000.00, 'new', 0, 0, 'active', 4.90, 14),
  (114, 40, 30, 10, 'Toyota Corolla Cross Hybrid 2024 (Zero Mileage, Pearl White)', 'toyota-corolla-cross-hybrid-2024-zero-mileage-pearl-white',
   'Brand new in stock, customs duty paid in Addis Ababa, Code 2 plate ready.',
   8600000.00, 'new', 1, 0, 'active', 5.00, 11),
  (115, 40, 30, 10, 'Suzuki Dzire Sedan 2023 (Automatic, Full Option)', 'suzuki-dzire-sedan-2023-automatic-full-option',
   'Ultra fuel efficient, 12,000 km low mileage, Addis Ababa plate Code 2.',
   3450000.00, 'used', 1, 0, 'active', 4.80, 16),
  (116, 41, 20, 10, 'Apple iPhone 16 Pro Max (512GB, Natural Titanium)', 'apple-iphone-16-pro-max-512gb-natural-titanium',
   'Brand new in box, 5G ready, 1 year Apple warranty.',
   180000.00, 'new', 0, 0, 'active', 5.00, 48),
  (117, 41, 21, 12, 'Samsung Galaxy S24 Ultra 5G (512GB, Titanium Gray)', 'samsung-galaxy-s24-ultra-5g-512gb-titanium-gray',
   'Built-in S-Pen, Galaxy AI live translate, 200MP quad camera.',
   178000.00, 'new', 0, 0, 'active', 4.90, 39),
  (118, 41, 1, 2, 'Apple MacBook Air 13" (M3 Chip, 16GB RAM, 512GB SSD)', 'apple-macbook-air-13-m3-chip-16gb-ram-512gb-ssd',
   'Liquid Retina display, 18-hour battery life, MagSafe 3, 2024 model.',
   168000.00, 'new', 1, 0, 'active', 5.00, 36),
  (119, 41, 1, 2, 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones', 'sony-wh-1000xm5-wireless-noise-canceling-headphones',
   'Auto NC optimizer, 30-hour battery, multipoint connection, crystal-clear mic.',
   48500.00, 'new', 0, 0, 'active', 5.00, 27);

-- ------------------------------------------------------------
-- listing images
-- ------------------------------------------------------------
INSERT INTO listing_images (listing_id, image_url, sort_order) VALUES
  (100, '/placeholder-images/lalibela_habesha_kemis.jpg', 0),
  (101, '/placeholder-images/teal_gold_habesha_dress.jpg', 0),
  (102, '/placeholder-images/mens_tibeb_shirt_set.jpg', 0),
  (103, '/placeholder-images/kids_timket_ensemble.jpg', 0),
  (104, '/placeholder-images/yirgacheffe_coffee_500g.jpg', 0),
  (105, '/placeholder-images/gondar_jebena_straw_base.jpg', 0),
  (106, '/placeholder-images/wanza_rekebot_sini_cups.jpg', 0),
  (107, '/placeholder-images/magna_white_teff.jpg', 0),
  (108, '/placeholder-images/gojjam_berbere_1kg.jpg', 0),
  (109, '/placeholder-images/modjo_leather_bag.jpg', 0),
  (110, '/placeholder-images/jimma_coffee_table_stools.jpg', 0),
  (111, '/placeholder-images/leather_chelsea_boots.jpg', 0),
  (112, '/placeholder-images/black_seed_hair_elixir.jpg', 0),
  (113, '/placeholder-images/bole_atlas_3br_apartment.jpg', 0),
  (114, '/placeholder-images/corolla_cross_hybrid_2024.jpg', 0),
  (115, '/placeholder-images/suzuki_dzire_2023.jpg', 0),
  (116, '/placeholder-images/iphone_16_pro_max.jpg', 0),
  (117, '/placeholder-images/galaxy_s24_ultra.jpg', 0),
  (118, '/placeholder-images/macbook_air_m3.jpg', 0),
  (119, '/placeholder-images/sony_wh1000xm5.jpg', 0);
