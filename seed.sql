INSERT OR IGNORE INTO site (
  id, hero_title, hero_lead, about, phone_display, email, towns,
  cta_primary, cta_secondary, quote_heading, quote_submit, quote_photos, quote_helper, updated_at
) VALUES (
  1,
  'Eugene and Springfield. We clean them.',
  'Houses, move-in, move-out, after the build, deep clean. Free estimates.',
  'M & M Professional Cleaning.
More than ten years.
Eugene, Springfield, and surrounding.
Estimates are free.
Call, text, or email.',
  '(541) 310-0590',
  'm.mprofessionalcleaning@yahoo.com',
  'Eugene / Springfield and surrounding',
  'Call (541) 310-0590',
  'Text (541) 310-0590',
  'Free estimate',
  'Send',
  'Photo of the job, optional',
  'Or call (541) 310-0590.',
  datetime('now')
);

INSERT INTO services (slug, name, sort_order) SELECT * FROM (SELECT
  'residential-cleaning' AS slug,
  'Residential Cleaning' AS name,
  0 AS sort_order
) WHERE NOT EXISTS (SELECT 1 FROM services);

INSERT INTO services (slug, name, sort_order) SELECT 'move-in-move-out', 'Move In / Move Out', 1 WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'move-in-move-out');
INSERT INTO services (slug, name, sort_order) SELECT 'post-construction', 'Post-Construction', 2 WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'post-construction');
INSERT INTO services (slug, name, sort_order) SELECT 'deep-cleaning', 'Deep Cleaning', 3 WHERE NOT EXISTS (SELECT 1 FROM services WHERE slug = 'deep-cleaning');

-- Do not insert photos. Empty D1 photos falls back to public/work stills.
-- Do not insert pairs. Zero is the default. Never invent a before/after.
-- Do not insert reviews. Zero featured means no quotes on the public site. Never invent a review.
