import type { Env } from "../../../../../_lib/env"
import { readSession } from "../../../../../_lib/session"

export async function onRequestGet({
  request,
  env,
  params,
}: {
  request: Request
  env: Env
  params: { id: string; file: string }
}) {
  const admin = await readSession(request, env)
  if (!admin) return new Response("Sign in.", { status: 401 })
  const id = Number(params.id)
  const file = decodeURIComponent(params.file || "")
  if (!id || !file || file.includes("..") || file.includes("/")) {
    return new Response("Not found", { status: 404 })
  }
  const key = `leads/${id}/${file}`
  const obj = await env.PHOTOS.get(key)
  if (!obj) return new Response("Not found", { status: 404 })
  const headers = new Headers()
  headers.set("cache-control", "private, max-age=3600")
  obj.writeHttpMetadata(headers)
  if (!headers.has("content-type")) headers.set("content-type", "image/jpeg")
  return new Response(obj.body, { headers })
}
