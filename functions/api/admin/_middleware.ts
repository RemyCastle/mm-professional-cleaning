import type { Env } from "../../_lib/env"
import { json } from "../../_lib/http"
import { ready } from "../../_lib/ready"
import { readSession } from "../../_lib/session"

export async function onRequest(context: {
  request: Request
  env: Env
  next: () => Promise<Response>
  data: Record<string, unknown>
}) {
  await ready(context.env)
  const admin = await readSession(context.request, context.env)
  if (!admin) return json({ error: "Sign in." }, 401)
  context.data.admin = admin
  return context.next()
}
