import type { Env } from "../../_lib/env"

export async function onRequestGet({
  env,
  params,
}: {
  env: Env
  params: { id: string }
}) {
  const row = await env.DB.prepare("SELECT r2_key FROM photos WHERE id = ?")
    .bind(Number(params.id))
    .first<{ r2_key: string | null }>()
  if (!row?.r2_key) return new Response("Not found", { status: 404 })
  const obj = await env.PHOTOS.get(row.r2_key)
  if (!obj) return new Response("Not found", { status: 404 })
  const headers = new Headers()
  headers.set("cache-control", "public, max-age=86400")
  obj.writeHttpMetadata(headers)
  if (!headers.has("content-type")) headers.set("content-type", "image/jpeg")
  return new Response(obj.body, { headers })
}
