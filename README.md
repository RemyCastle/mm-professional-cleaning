# M & M Professional Cleaning

Marketing site for **M & M Professional Cleaning** in Eugene and Springfield, Oregon.
Public site is a Next.js static export on Cloudflare Pages. Admin is `/admin` (bookmark only, not linked in chrome).

No printed custom domain. Host later as a Cloudflare Pages project. Do not invent DNS.

## Stack

- Next.js App Router (`output: 'export'`), publish `out/`
- Cloudflare Pages Functions in `/functions` (APIs + session)
- D1 `mm-professional-cleaning` (binding `DB`) — new database, not Sharky's
- R2 `mm-professional-cleaning-photos` (binding `PHOTOS`) — new bucket, not Sharky's or Solid Craft's

## Local public static

```bash
npm install
npm run build
```

## Local admin (Pages Functions + D1)

```bash
cp .dev.vars.example .dev.vars
# put a new SESSION_SECRET in .dev.vars (do not reuse Sharky's or Solid Craft's)
npm run build
npx wrangler d1 execute mm-professional-cleaning --local --file=schema.sql
npx wrangler d1 execute mm-professional-cleaning --local --file=seed.sql
npx wrangler pages dev ./out
```

Open `/admin`. First visit: create owner. Then Site / Requests / Photos / Reviews / Users.

Work stills: four stock photos in `public/work/`, captions are the four card services only. If D1 photos is empty, those stills show. No fake before/after pairs.

Featured reviews are optional. Paste a real quote (name, stars, text). Public shows featured only, highest stars first. Zero featured means no review quotes on the page. Do not invent reviews.

## Deploy

Pages project `mm-professional-cleaning`. Build: `npm ci && npm run build`. Output: `out`. Do not run crop or remap scripts on Remy's logo.

```bash
npx wrangler d1 execute mm-professional-cleaning --remote --file=schema.sql
npx wrangler d1 execute mm-professional-cleaning --remote --file=seed.sql
npx wrangler pages secret put SESSION_SECRET --project-name=mm-professional-cleaning
```

Create D1 `mm-professional-cleaning` and R2 `mm-professional-cleaning-photos`, then put the real `database_id` in `wrangler.jsonc`. Do not invent DNS. Not Render.

## Contact on the site

- Call [(541) 310-0590](tel:+15413100590)
- Text [(541) 310-0590](sms:+15413100590)
- Email [m.mprofessionalcleaning@yahoo.com](mailto:m.mprofessionalcleaning@yahoo.com)
- Area: Eugene / Springfield and surrounding
- Voice copy is locked. Do not print "And more." as a fifth trade.

No street. No owner name. No CCB. No hours. No prices. No invented reviews. No extra trades. No custom domain on the page.

## Look

Look only. Voice copy still wins on words.

- Ground `#66C178`
- Ink `#FAFCFA`
- Hot `#F2C344` — the only accent (buttons, stripe)
- Mute `#3D7A52`

Not Sharky `#3F8C10`. Not Solid Craft charcoal/brass.

Great Vibes for **M & M** only. Manrope for PROFESSIONAL CLEANING and UI. Never Big Shoulders, Libre Franklin, Teko, or Cinzel.

- `public/logo.jpeg` — Remy's exact logo (woman + broom + real M & M script). Header and hero. Do not redraw, crop, or remap.
- `marks.logo` and `marks.logoMark` both point at `/logo.jpeg`.
