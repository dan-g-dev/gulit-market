-- ============================================================
-- Gulit Market — LOCAL version (your local db uses image_url,
-- not url, per the schema drift we found earlier).
-- ============================================================

INSERT INTO listing_images (listing_id, image_url, sort_order)
SELECT id, CONCAT('https://picsum.photos/seed/gulit', id, '/800/600'), 1
FROM listings;
