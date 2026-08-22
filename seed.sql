INSERT OR IGNORE INTO site (
  id, hero_title, hero_lead, about, phone_display, email, towns,
  cta_primary, cta_secondary, quote_heading, quote_submit, quote_photos, quote_helper, updated_at
) VALUES (
  1,
  'Residential, move-in, deep clean. Call for a free estimate.',
  'Eugene and Springfield. Ten years at it.',
  'We clean homes in Eugene and Springfield.
Ten years at it.
Estimates are free.
Call, text, or email.',
  '(541) 310-0590',
  'm.mprofessionalcleaning@yahoo.com',
  'Eugene/Springfield and surrounding areas',
  'Call (541) 310-0590',
  'Email us',
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

-- Do not insert photos. No photo means the job type stays off Work.
-- Do not insert pairs. Zero is the default. Never invent a before/after.
