import type { Env } from "../../_lib/env"
import { json } from "../../_lib/http"

export async function onRequestGet({ env }: { env: Env }) {
  const rows = await env.DB.prepare(
    "SELECT id, src, alt, caption, width, height, sort_order FROM photos ORDER BY sort_order, id",
  ).all()
  return json({ photos: rows.results || [] })
}

async function putPhotoFile(env: Env, id: number, file: File) {
  const key = `work/${id}-${file.name.replace(/[^\w.\-]+/g, "_")}`
  await env.PHOTOS.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || "image/jpeg" },
  })
  const src = `/api/media/${id}`
  await env.DB.prepare("UPDATE photos SET src = ?, r2_key = ? WHERE id = ?")
    .bind(src, key, id)
    .run()
  return { src, key }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const form = await request.formData()
  const file = form.get("file")
  const caption = String(form.get("caption") || "").trim()
  const existingId = Number(form.get("id") || 0)
  if (existingId) {
    if (!(file instanceof File) || !file.size) return json({ error: "Add a photo." }, 400)
    const row = await env.DB.prepare("SELECT id FROM photos WHERE id = ?").bind(existingId).first()
    if (!row) return json({ error: "Missing photo." }, 404)
    const stored = await putPhotoFile(env, existingId, file)
    return json({ id: existingId, src: stored.src })
  }
  if (!caption) return json({ error: "Pick a job type." }, 400)
  const alt = caption
  const max = await env.DB.prepare("SELECT COALESCE(MAX(sort_order), -1) AS n FROM photos").first<{ n: number }>()
  const sort = (max?.n ?? -1) + 1
  const created = await env.DB.prepare(
    "INSERT INTO photos (src, alt, caption, width, height, sort_order) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind("", alt, caption, 1080, 1080, sort)
    .run()
  const id = Number(created.meta.last_row_id)
  if (!(file instanceof File) || !file.size) {
    return json({ id, src: "", caption, alt })
  }
  const stored = await putPhotoFile(env, id, file)
  return json({ id, src: stored.src, caption, alt })
}

export async function onRequestPatch({ request, env }: { request: Request; env: Env }) {
  const body = (await request.json()) as {
    id?: number
    caption?: string
    alt?: string
    order?: number[]
  }
  if (Array.isArray(body.order)) {
    for (const [i, id] of body.order.entries()) {
      await env.DB.prepare("UPDATE photos SET sort_order = ? WHERE id = ?").bind(i, id).run()
    }
    return json({ ok: true })
  }
  const id = Number(body.id)
  if (!id) return json({ error: "Missing photo." }, 400)
  const caption = String(body.caption || "").trim()
  const alt = String(body.alt || caption).trim()
  if (!caption) return json({ error: "Pick a job type." }, 400)
  await env.DB.prepare("UPDATE photos SET caption = ?, alt = ? WHERE id = ?")
    .bind(caption, alt, id)
    .run()
  return json({ ok: true })
}

export async function onRequestDelete({ request, env }: { request: Request; env: Env }) {
  const url = new URL(request.url)
  const id = Number(url.searchParams.get("id"))
  if (!id) return json({ error: "Missing photo." }, 400)
  const row = await env.DB.prepare("SELECT r2_key FROM photos WHERE id = ?")
    .bind(id)
    .first<{ r2_key: string | null }>()
  if (row?.r2_key) {
    try {
      await env.PHOTOS.delete(row.r2_key)
    } catch {
      // keep going
    }
  }
  await env.DB.prepare("DELETE FROM photos WHERE id = ?").bind(id).run()
  return json({ ok: true })
}
