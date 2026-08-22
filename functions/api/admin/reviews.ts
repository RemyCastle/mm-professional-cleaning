import type { Env } from "../../_lib/env"
import { json } from "../../_lib/http"

type ReviewIn = {
  id?: number
  name?: string
  stars?: unknown
  text?: string
  featured?: unknown
}

function list(env: Env) {
  return env.DB.prepare(
    "SELECT id, name, stars, body AS text, featured, created_at FROM reviews ORDER BY featured DESC, stars DESC, id DESC",
  ).all()
}

function parse(body: ReviewIn) {
  const name = String(body.name || "").trim()
  const text = String(body.text || "").trim()
  const stars = Number(body.stars)
  if (!name || !text) return { error: "Name and the quote." }
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return { error: "Stars are 1 to 5." }
  }
  const featured = body.featured === true || body.featured === 1 || body.featured === "1" ? 1 : 0
  return { name, text, stars, featured }
}

export async function onRequestGet({ env }: { env: Env }) {
  const rows = await list(env)
  return json({ reviews: rows.results || [] })
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const parsed = parse((await request.json()) as ReviewIn)
  if ("error" in parsed) return json({ error: parsed.error }, 400)
  await env.DB.prepare(
    "INSERT INTO reviews (name, stars, body, featured, created_at) VALUES (?, ?, ?, ?, datetime('now'))",
  )
    .bind(parsed.name, parsed.stars, parsed.text, parsed.featured)
    .run()
  const rows = await list(env)
  return json({ reviews: rows.results || [] })
}

export async function onRequestPatch({ request, env }: { request: Request; env: Env }) {
  const body = (await request.json()) as ReviewIn
  const id = Number(body.id)
  if (!id) return json({ error: "Missing review." }, 400)
  const parsed = parse(body)
  if ("error" in parsed) return json({ error: parsed.error }, 400)
  await env.DB.prepare("UPDATE reviews SET name = ?, stars = ?, body = ?, featured = ? WHERE id = ?")
    .bind(parsed.name, parsed.stars, parsed.text, parsed.featured, id)
    .run()
  const rows = await list(env)
  return json({ reviews: rows.results || [] })
}

export async function onRequestDelete({ request, env }: { request: Request; env: Env }) {
  const id = Number(new URL(request.url).searchParams.get("id"))
  if (!id) return json({ error: "Missing review." }, 400)
  await env.DB.prepare("DELETE FROM reviews WHERE id = ?").bind(id).run()
  const rows = await list(env)
  return json({ reviews: rows.results || [] })
}
