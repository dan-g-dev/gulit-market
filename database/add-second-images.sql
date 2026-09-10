-- ============================================================
-- Gulit Market — adds a second image per listing so the
-- hover-swap effect in ProductCard.tsx has something to show.
--
-- Uses Lorem Picsum (picsum.photos), a free placeholder photo
-- service built on Unsplash's open license (explicitly free for
-- any use, no attribution required) — NOT scraped/copied real
-- product photos, since those would belong to someone else.
-- Each listing gets a different seeded image so they're not all
-- identical, but they will NOT match the actual product (a coffee
-- table might show a random landscape, etc.) — that's expected
-- per your instruction that relevance didn't matter here.
--
-- Safe to run once; re-running would just add duplicate rows.
-- ============================================================

INSERT INTO listing_images (listing_id, url, sort_order)
SELECT id, CONCAT('https://picsum.photos/seed/gulit', id, '/800/600'), 1
FROM listings;