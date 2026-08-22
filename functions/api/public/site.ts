import type { Env } from "../../_lib/env"
import { json } from "../../_lib/http"
import { ready } from "../../_lib/ready"

export async function onRequestGet({ env }: { env: Env }) {
  try {
    await ready(env)
    const site = await env.DB.prepare("SELECT * FROM site WHERE id = 1").first()
    const services = await env.DB.prepare(
      "SELECT id, slug, name, sort_order FROM services ORDER BY sort_order, id",
    ).all()
    if (!site) return json({ error: "no site" }, 404)
    return json({ site, services: services.results || [] })
  } catch {
    return json({ error: "unavailable" }, 503)
  }
}
