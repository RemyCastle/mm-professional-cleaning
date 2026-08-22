import type { Env } from "../../_lib/env"
import { json } from "../../_lib/http"
import { photoIsPublic } from "../../_lib/pairs"
import { ready } from "../../_lib/ready"

export async function onRequestGet({ env }: { env: Env }) {
  try {
    await ready(env)
    const photos = await env.DB.prepare(
      "SELECT id, src, alt, caption, width, height, sort_order FROM photos ORDER BY sort_order, id",
    ).all<{ src: string }>()
    return json({ photos: (photos.results || []).filter(photoIsPublic) })
  } catch {
    return json({ error: "unavailable" }, 503)
  }
}
