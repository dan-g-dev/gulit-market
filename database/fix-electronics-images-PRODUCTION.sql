-- ============================================================
-- Gulit Market — swaps the broken primary image for the 4
-- electronics listings (iPhone, Galaxy S24, MacBook Air, Sony
-- headphones — listing IDs 116-119) to a Picsum placeholder,
-- since no real generated photos exist for these.
-- PRODUCTION version (uses "url" column).
-- ============================================================

UPDATE listing_images
SET url = CONCAT('https://picsum.photos/seed/gulitmain', listing_id, '/800/600')
WHERE listing_id IN (116, 117, 118, 119) AND sort_order = 0;
