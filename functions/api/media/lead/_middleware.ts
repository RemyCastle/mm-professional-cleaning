import type { Env } from "../../../_lib/env"
import { json } from "../../../_lib/http"
import { readSession } from "../../../_lib/session"

export async function onRequest(context: {
  request: Request
  env: Env
  next: () => Promise<Response>
}) {
  const admin = await readSession(context.request, context.env)
  if (!admin) return json({ error: "Sign in." }, 401)
  return context.next()
}
