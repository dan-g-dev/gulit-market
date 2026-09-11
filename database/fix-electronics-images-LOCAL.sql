-- ============================================================
-- LOCAL version (uses "image_url" column, per the schema drift).
-- ============================================================

UPDATE listing_images
SET image_url = CONCAT('https://picsum.photos/seed/gulitmain', listing_id, '/800/600')
WHERE listing_id IN (116, 117, 118, 119) AND sort_order = 0;
