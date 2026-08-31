-- ============================================================
-- Gulit Market — MySQL schema
-- snake_case fields throughout; every table has created_at (and
-- updated_at where rows are mutated after creation).
-- ============================================================

SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- roles: fixed set of account roles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id TINYINT UNSIGNED PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE  -- 'customer' | 'seller' | 'admin'
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id TINYINT UNSIGNED NOT NULL DEFAULT 1,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(30),
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- locations: self-referencing hierarchy
-- (Ethiopia -> Addis Ababa -> Bole, etc.)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS locations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parent_id INT UNSIGNED NULL,
  name VARCHAR(120) NOT NULL,
  name_am VARCHAR(120),
  level ENUM('country', 'city', 'district') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_locations_parent FOREIGN KEY (parent_id) REFERENCES locations(id) ON DELETE CASCADE,
  KEY idx_locations_parent (parent_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- categories: self-referencing hierarchy
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parent_id INT UNSIGNED NULL,
  name VARCHAR(120) NOT NULL,
  name_am VARCHAR(120),
  slug VARCHAR(140) NOT NULL,
  icon VARCHAR(60),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_categories_slug (slug),
  CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE,
  KEY idx_categories_parent (parent_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- seller_profiles: one per seller user
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seller_profiles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  store_name VARCHAR(150) NOT NULL,
  store_name_am VARCHAR(150),
  bio TEXT,
  bio_am TEXT,
  cover_image_url VARCHAR(500),
  location_id INT UNSIGNED,
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  rating DECIMAL(2,1) NOT NULL DEFAULT 0.0,
  review_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_seller_profiles_user (user_id),
  CONSTRAINT fk_seller_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_seller_profiles_location FOREIGN KEY (location_id) REFERENCES locations(id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- listings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  seller_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  location_id INT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  title_am VARCHAR(200),
  description TEXT,
  description_am TEXT,
  price_etb DECIMAL(12,2) NOT NULL,
  condition_type ENUM('new', 'like_new', 'good', 'fair', 'for_parts') NOT NULL DEFAULT 'good',
  is_negotiable TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('active', 'sold', 'inactive') NOT NULL DEFAULT 'active',
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  view_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_listings_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_listings_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_listings_location FOREIGN KEY (location_id) REFERENCES locations(id),
  KEY idx_listings_category (category_id),
  KEY idx_listings_location (location_id),
  KEY idx_listings_seller (seller_id),
  KEY idx_listings_status (status),
  FULLTEXT KEY ft_listings_title_desc (title, description)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- listing_images
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listing_images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  listing_id INT UNSIGNED NOT NULL,
  url VARCHAR(500) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_listing_images_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  KEY idx_listing_images_listing (listing_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- favorites (wishlist)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS favorites (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  listing_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_favorites_user_listing (user_id, listing_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorites_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- cart / cart_items — one open cart per user
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cart_user (user_id),
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cart_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cart_id INT UNSIGNED NOT NULL,
  listing_id INT UNSIGNED NOT NULL,
  quantity SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cart_items_cart_listing (cart_id, listing_id),
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- orders / order_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(30) NOT NULL,
  buyer_id INT UNSIGNED NOT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
    NOT NULL DEFAULT 'pending',
  subtotal_etb DECIMAL(12,2) NOT NULL,
  delivery_fee_etb DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_etb DECIMAL(12,2) NOT NULL,
  delivery_full_name VARCHAR(120) NOT NULL,
  delivery_phone VARCHAR(30) NOT NULL,
  delivery_region VARCHAR(120) NOT NULL,
  delivery_city VARCHAR(120) NOT NULL,
  delivery_subcity VARCHAR(120),
  delivery_woreda VARCHAR(120),
  delivery_address VARCHAR(255),
  delivery_instructions VARCHAR(500),
  payment_provider VARCHAR(30) NOT NULL,        -- 'cash_on_delivery' | 'telebirr'
  payment_status ENUM('pending', 'processing', 'paid', 'failed', 'cancelled')
    NOT NULL DEFAULT 'pending',
  transaction_reference VARCHAR(120),
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_orders_order_number (order_number),
  CONSTRAINT fk_orders_buyer FOREIGN KEY (buyer_id) REFERENCES users(id),
  KEY idx_orders_buyer (buyer_id),
  KEY idx_orders_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  listing_id INT UNSIGNED NULL,
  seller_id INT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,       -- snapshot at time of purchase
  unit_price_etb DECIMAL(12,2) NOT NULL,
  quantity SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL,
  CONSTRAINT fk_order_items_seller FOREIGN KEY (seller_id) REFERENCES users(id),
  KEY idx_order_items_order (order_id),
  KEY idx_order_items_seller (seller_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- payments — one row per payment attempt against an order
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  provider VARCHAR(30) NOT NULL,      -- 'cash_on_delivery' | 'telebirr'
  status ENUM('pending', 'processing', 'paid', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
  amount_etb DECIMAL(12,2) NOT NULL,
  transaction_reference VARCHAR(120),
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  KEY idx_payments_order (order_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- reviews — one per (buyer, order, listing), i.e. verified purchase only
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  listing_id INT UNSIGNED NOT NULL,
  order_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_reviews_order_listing (order_id, listing_id),
  CONSTRAINT fk_reviews_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
  KEY idx_reviews_listing (listing_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- offers — negotiation on a negotiable listing
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS offers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  listing_id INT UNSIGNED NOT NULL,
  buyer_id INT UNSIGNED NOT NULL,
  seller_id INT UNSIGNED NOT NULL,
  amount_etb DECIMAL(12,2) NOT NULL,
  message VARCHAR(500),
  status ENUM('pending', 'accepted', 'rejected', 'countered') NOT NULL DEFAULT 'pending',
  counter_amount_etb DECIMAL(12,2),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_offers_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  CONSTRAINT fk_offers_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_offers_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_offers_listing (listing_id),
  KEY idx_offers_seller (seller_id)
) ENGINE=InnoDB;
