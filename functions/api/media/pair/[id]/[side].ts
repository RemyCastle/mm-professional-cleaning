import type { Env } from "../../../../../_lib/env"

export async function onRequestGet({
  env,
  params,
}: {
  env: Env
  params: { id: string; side: string }
}) {
  const id = Number(params.id)
  const side = String(params.side || "")
  if (!id || (side !== "before" && side !== "after")) {
    return new Response("Not found", { status: 404 })
  }
  const column = side === "before" ? "before_r2_key" : "after_r2_key"
  const srcColumn = side === "before" ? "before_src" : "after_src"
  const row = await env.DB.prepare(
    `SELECT ${column} AS r2_key, ${srcColumn} AS src FROM pairs WHERE id = ?`,
  )
    .bind(id)
    .first<{ r2_key: string | null; src: string | null }>()
  if (!row?.r2_key || !String(row.src || "").trim()) {
    return new Response("Not found", { status: 404 })
  }
  const obj = await env.PHOTOS.get(row.r2_key)
  if (!obj) return new Response("Not found", { status: 404 })
  const headers = new Headers()
  headers.set("cache-control", "public, max-age=86400")
  obj.writeHttpMetadata(headers)
  if (!headers.has("content-type")) headers.set("content-type", "image/jpeg")
  return new Response(obj.body, { headers })
}
