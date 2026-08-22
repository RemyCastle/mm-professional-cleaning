import type { Env } from "../../_lib/env"
import { json } from "../../_lib/http"
import { hashPassword, verifyPassword } from "../../_lib/password"
import type { AdminRow } from "../../_lib/session"

export async function onRequestGet({ env }: { env: Env }) {
  const rows = await env.DB.prepare("SELECT id, name, created_at FROM admins ORDER BY id").all()
  return json({ users: rows.results || [] })
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const body = (await request.json()) as { name?: string; password?: string }
  const name = String(body.name || "").trim()
  const password = String(body.password || "")
  if (!name || password.length < 8) {
    return json({ error: "Name and a password of at least 8 characters." }, 400)
  }
  const exists = await env.DB.prepare("SELECT id FROM admins WHERE name = ?").bind(name).first()
  if (exists) return json({ error: "That name is already an admin." }, 409)
  const hash = await hashPassword(password)
  await env.DB.prepare(
    "INSERT INTO admins (name, password_hash, created_at) VALUES (?, ?, datetime('now'))",
  )
    .bind(name, hash)
    .run()
  return onRequestGet({ env })
}

export async function onRequestPatch({
  request,
  env,
  data,
}: {
  request: Request
  env: Env
  data: { admin: AdminRow }
}) {
  const body = (await request.json()) as {
    current?: string
    password?: string
  }
  const current = String(body.current || "")
  const password = String(body.password || "")
  if (password.length < 8) return json({ error: "New password needs 8 characters." }, 400)
  const row = await env.DB.prepare("SELECT password_hash FROM admins WHERE id = ?")
    .bind(data.admin.id)
    .first<{ password_hash: string }>()
  if (!row || !(await verifyPassword(current, row.password_hash))) {
    return json({ error: "Current password is wrong." }, 401)
  }
  const hash = await hashPassword(password)
  await env.DB.prepare("UPDATE admins SET password_hash = ? WHERE id = ?")
    .bind(hash, data.admin.id)
    .run()
  return json({ ok: true })
}

export async function onRequestDelete({
  request,
  env,
}: {
  request: Request
  env: Env
}) {
  const id = Number(new URL(request.url).searchParams.get("id"))
  if (!id) return json({ error: "Missing admin." }, 400)
  const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM admins").first<{ n: number }>()
  if (!count || count.n <= 1) return json({ error: "Cannot remove the last admin." }, 400)
  await env.DB.prepare("DELETE FROM admins WHERE id = ?").bind(id).run()
  return onRequestGet({ env })
}
