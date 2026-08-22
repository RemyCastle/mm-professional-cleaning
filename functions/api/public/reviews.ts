import type { Env } from "../../_lib/env"
import { json } from "../../_lib/http"
import { ready } from "../../_lib/ready"

export async function onRequestGet({ env }: { env: Env }) {
  try {
    await ready(env)
    const rows = await env.DB.prepare(
      "SELECT id, name, stars, body AS text FROM reviews WHERE featured = 1 ORDER BY stars DESC, id DESC",
    ).all()
    return json({ reviews: rows.results || [] })
  } catch {
    return json({ error: "unavailable" }, 503)
  }
}
