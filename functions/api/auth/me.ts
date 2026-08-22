import type { Env } from "../../_lib/env"
import { json } from "../../_lib/http"
import { ready } from "../../_lib/ready"
import { readSession } from "../../_lib/session"

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  await ready(env)
  const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM admins").first<{ n: number }>()
  const setup = !count || count.n === 0
  const admin = await readSession(request, env)
  return json({ setup, admin })
}
