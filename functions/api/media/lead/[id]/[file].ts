import type { Env } from "../../../../../_lib/env"

export async function onRequestGet({
  env,
  params,
}: {
  env: Env
  params: { id: string; file: string }
}) {
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
