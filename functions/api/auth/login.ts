import type { Env } from "../../_lib/env"
import { json } from "../../_lib/http"
import { verifyPassword } from "../../_lib/password"
import { ready } from "../../_lib/ready"
import { cookieHeader, signSession } from "../../_lib/session"

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  await ready(env)
  if (!env.SESSION_SECRET) return json({ error: "SESSION_SECRET is not set." }, 500)
  const body = (await request.json()) as { name?: string; password?: string }
  const name = String(body.name || "").trim()
  const password = String(body.password || "")
  const row = await env.DB.prepare("SELECT id, name, password_hash FROM admins WHERE name = ?")
    .bind(name)
    .first<{ id: number; name: string; password_hash: string }>()
  if (!row || !(await verifyPassword(password, row.password_hash))) {
    return json({ error: "Name or password is wrong." }, 401)
  }
  const token = await signSession(env.SESSION_SECRET, { id: row.id, name: row.name })
  const res = json({ admin: { id: row.id, name: row.name } })
  res.headers.set("set-cookie", cookieHeader(token, new URL(request.url).protocol === "https:"))
  return res
}
