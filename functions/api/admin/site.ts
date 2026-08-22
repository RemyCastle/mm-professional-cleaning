import type { Env } from "../../_lib/env"
import { json } from "../../_lib/http"
import { slugify } from "../../_lib/ready"

type ServiceIn = { id?: number; slug?: string; name: string }

export async function onRequestGet({ env }: { env: Env }) {
  const site = await env.DB.prepare("SELECT * FROM site WHERE id = 1").first()
  const services = await env.DB.prepare(
    "SELECT id, slug, name, sort_order FROM services ORDER BY sort_order, id",
  ).all()
  return json({ site, services: services.results || [] })
}

export async function onRequestPut({ request, env }: { request: Request; env: Env }) {
  const body = (await request.json()) as {
    site?: Record<string, string>
    services?: ServiceIn[]
  }
  const s = body.site || {}
  const fields = [
    "hero_title",
    "hero_lead",
    "about",
    "phone_display",
    "email",
    "towns",
    "cta_primary",
    "cta_secondary",
    "quote_heading",
    "quote_submit",
    "quote_photos",
    "quote_helper",
  ] as const
  const values = fields.map((key) => String(s[key] || "").trim())
  if (values.some((v) => !v)) return json({ error: "Fill every site field." }, 400)
  if (String(s.towns || "").match(/\d{3,}/)) {
    return json({ error: "Do not put a street on the public site." }, 400)
  }
  await env.DB.prepare(
    `UPDATE site SET hero_title=?, hero_lead=?, about=?, phone_display=?, email=?, towns=?,
     cta_primary=?, cta_secondary=?, quote_heading=?, quote_submit=?, quote_photos=?, quote_helper=?,
     updated_at=datetime('now') WHERE id = 1`,
  )
    .bind(...values)
    .run()

  if (Array.isArray(body.services)) {
    await env.DB.prepare("DELETE FROM services").run()
    for (const [i, row] of body.services.entries()) {
      const name = String(row.name || "").trim()
      if (!name) continue
      await env.DB.prepare("INSERT INTO services (slug, name, sort_order) VALUES (?, ?, ?)")
        .bind(row.slug || slugify(name), name, i)
        .run()
    }
  }
  return onRequestGet({ env })
}
