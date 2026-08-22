CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS site (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  hero_title TEXT NOT NULL,
  hero_lead TEXT NOT NULL,
  about TEXT NOT NULL,
  phone_display TEXT NOT NULL,
  email TEXT NOT NULL,
  towns TEXT NOT NULL,
  cta_primary TEXT NOT NULL,
  cta_secondary TEXT NOT NULL,
  quote_heading TEXT NOT NULL,
  quote_submit TEXT NOT NULL,
  quote_photos TEXT NOT NULL,
  quote_helper TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  src TEXT NOT NULL,
  r2_key TEXT,
  alt TEXT NOT NULL,
  caption TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  need TEXT NOT NULL,
  has_photos INTEGER NOT NULL DEFAULT 0,
  photo_note TEXT,
  status TEXT NOT NULL DEFAULT 'New'
);

-- Optional featured reviews. Never seed rows. Public only shows featured
-- quotes, highest stars first. Zero featured means no quotes on the page.
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  stars INTEGER NOT NULL,
  body TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

-- Optional before/after pairs. Never seed rows. Public Work only shows
-- a pair when both images exist and visible = 1.
CREATE TABLE IF NOT EXISTS pairs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  before_src TEXT NOT NULL DEFAULT '',
  before_r2_key TEXT,
  after_src TEXT NOT NULL DEFAULT '',
  after_r2_key TEXT,
  caption TEXT NOT NULL DEFAULT '',
  visible INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
