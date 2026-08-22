import type { Env } from "../../_lib/env"
import { json } from "../../_lib/http"
import { hashPassword } from "../../_lib/password"
import { ready } from "../../_lib/ready"
import { cookieHeader, signSession } from "../../_lib/session"

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  await ready(env)
  if (!env.SESSION_SECRET) return json({ error: "SESSION_SECRET is not set." }, 500)
  const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM admins").first<{ n: number }>()
  if (count && count.n > 0) return json({ error: "Owner already exists." }, 403)
  const body = (await request.json()) as { name?: string; password?: string }
  const name = String(body.name || "").trim()
  const password = String(body.password || "")
  if (!name || password.length < 8) {
    return json({ error: "Name and a password of at least 8 characters." }, 400)
  }
  const hash = await hashPassword(password)
  const created = await env.DB.prepare(
    "INSERT INTO admins (name, password_hash, created_at) VALUES (?, ?, datetime('now'))",
  )
    .bind(name, hash)
    .run()
  const admin = { id: Number(created.meta.last_row_id), name }
  const token = await signSession(env.SESSION_SECRET, admin)
  const res = json({ admin })
  res.headers.set("set-cookie", cookieHeader(token, new URL(request.url).protocol === "https:"))
  return res
}
