import type { Env } from "./env"

const SCHEMA = `
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
`

const SITE_SEED = {
  hero_title: "Eugene and Springfield. We clean them.",
  hero_lead: "Houses, move-in, move-out, after the build, deep clean. Free estimates.",
  about:
    "M & M Professional Cleaning.\nMore than ten years.\nEugene, Springfield, and surrounding.\nEstimates are free.\nCall, text, or email.",
  phone_display: "(541) 310-0590",
  email: "m.mprofessionalcleaning@yahoo.com",
  towns: "Eugene / Springfield and surrounding",
  cta_primary: "Call (541) 310-0590",
  cta_secondary: "Text (541) 310-0590",
  quote_heading: "Free estimate",
  quote_submit: "Send",
  quote_photos: "Photo of the job, optional",
  quote_helper: "Or call (541) 310-0590.",
}

const SERVICE_SEED = [
  { slug: "residential-cleaning", name: "Residential Cleaning" },
  { slug: "move-in-move-out", name: "Move In / Move Out" },
  { slug: "post-construction", name: "Post-Construction" },
  { slug: "deep-cleaning", name: "Deep Cleaning" },
]

export async function ready(env: Env) {
  for (const statement of SCHEMA.split(";").map((s) => s.trim()).filter(Boolean)) {
    await env.DB.prepare(statement).run()
  }
  const site = await env.DB.prepare("SELECT id, hero_title FROM site WHERE id = 1").first<{
    id: number
    hero_title: string
  }>()
  if (site?.hero_title === "Residential, move-in, deep clean. Call for a free estimate.") {
    await env.DB.prepare(
      `UPDATE site SET hero_title=?, hero_lead=?, about=?, phone_display=?, email=?, towns=?,
        cta_primary=?, cta_secondary=?, quote_heading=?, quote_submit=?, quote_photos=?, quote_helper=?,
        updated_at=datetime('now') WHERE id = 1`,
    )
      .bind(
        SITE_SEED.hero_title,
        SITE_SEED.hero_lead,
        SITE_SEED.about,
        SITE_SEED.phone_display,
        SITE_SEED.email,
        SITE_SEED.towns,
        SITE_SEED.cta_primary,
        SITE_SEED.cta_secondary,
        SITE_SEED.quote_heading,
        SITE_SEED.quote_submit,
        SITE_SEED.quote_photos,
        SITE_SEED.quote_helper,
      )
      .run()
  }
  if (!site) {
    await env.DB.prepare(
      `INSERT INTO site (id, hero_title, hero_lead, about, phone_display, email, towns,
        cta_primary, cta_secondary, quote_heading, quote_submit, quote_photos, quote_helper, updated_at)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    )
      .bind(
        SITE_SEED.hero_title,
        SITE_SEED.hero_lead,
        SITE_SEED.about,
        SITE_SEED.phone_display,
        SITE_SEED.email,
        SITE_SEED.towns,
        SITE_SEED.cta_primary,
        SITE_SEED.cta_secondary,
        SITE_SEED.quote_heading,
        SITE_SEED.quote_submit,
        SITE_SEED.quote_photos,
        SITE_SEED.quote_helper,
      )
      .run()
  }
  const serviceCount = await env.DB.prepare("SELECT COUNT(*) AS n FROM services").first<{ n: number }>()
  if (!serviceCount || serviceCount.n === 0) {
    for (const [i, row] of SERVICE_SEED.entries()) {
      await env.DB.prepare("INSERT INTO services (slug, name, sort_order) VALUES (?, ?, ?)")
        .bind(row.slug, row.name, i)
        .run()
    }
  }
}

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "service"
}
