import type { Env } from "../../_lib/env"
import { json } from "../../_lib/http"
import { pairIsComplete } from "../../_lib/pairs"

type PairRow = {
  id: number
  before_src: string
  before_r2_key: string | null
  after_src: string
  after_r2_key: string | null
  caption: string
  visible: number
  sort_order: number
}

function safeName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_").slice(0, 80) || "photo.jpg"
}

async function dropKey(env: Env, key: string | null | undefined) {
  if (!key) return
  try {
    await env.PHOTOS.delete(key)
  } catch {
    // keep going
  }
}

export async function onRequestGet({ env }: { env: Env }) {
  const rows = await env.DB.prepare(
    `SELECT id, before_src, after_src, caption, visible, sort_order
     FROM pairs ORDER BY sort_order, id`,
  ).all<PairRow>()
  return json({ pairs: rows.results || [] })
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const form = await request.formData()
  const before = form.get("before")
  const after = form.get("after")
  const caption = String(form.get("caption") || "").trim()
  const wantVisible = form.get("visible") === "1" || form.get("visible") === "on"
  if (!caption) return json({ error: "Pick a job type." }, 400)
  if (!(before instanceof File) || !before.size) {
    return json({ error: "Add a real Before photo." }, 400)
  }
  if (!(after instanceof File) || !after.size) {
    return json({ error: "Add a real After photo." }, 400)
  }
  const max = await env.DB.prepare("SELECT COALESCE(MAX(sort_order), -1) AS n FROM pairs").first<{ n: number }>()
  const sort = (max?.n ?? -1) + 1
  const created = await env.DB.prepare(
    `INSERT INTO pairs (before_src, after_src, caption, visible, sort_order, created_at)
     VALUES ('', '', ?, 0, ?, datetime('now'))`,
  )
    .bind(caption, sort)
    .run()
  const id = Number(created.meta.last_row_id)
  const beforeKey = `pairs/${id}-before-${safeName(before.name)}`
  const afterKey = `pairs/${id}-after-${safeName(after.name)}`
  try {
    await env.PHOTOS.put(beforeKey, await before.arrayBuffer(), {
      httpMetadata: { contentType: before.type || "image/jpeg" },
    })
    await env.PHOTOS.put(afterKey, await after.arrayBuffer(), {
      httpMetadata: { contentType: after.type || "image/jpeg" },
    })
  } catch {
    await dropKey(env, beforeKey)
    await dropKey(env, afterKey)
    await env.DB.prepare("DELETE FROM pairs WHERE id = ?").bind(id).run()
    return json({ error: "Could not store both photos." }, 500)
  }
  const beforeSrc = `/api/media/pair/${id}/before`
  const afterSrc = `/api/media/pair/${id}/after`
  const visible = wantVisible && pairIsComplete({ before_src: beforeSrc, after_src: afterSrc }) ? 1 : 0
  await env.DB.prepare(
    `UPDATE pairs SET before_src = ?, before_r2_key = ?, after_src = ?, after_r2_key = ?, visible = ?
     WHERE id = ?`,
  )
    .bind(beforeSrc, beforeKey, afterSrc, afterKey, visible, id)
    .run()
  return json({
    id,
    before_src: beforeSrc,
    after_src: afterSrc,
    caption,
    visible,
  })
}

export async function onRequestPatch({ request, env }: { request: Request; env: Env }) {
  const body = (await request.json()) as {
    id?: number
    caption?: string
    visible?: number | boolean
    order?: number[]
  }
  if (Array.isArray(body.order)) {
    for (const [i, id] of body.order.entries()) {
      await env.DB.prepare("UPDATE pairs SET sort_order = ? WHERE id = ?").bind(i, id).run()
    }
    return json({ ok: true })
  }
  const id = Number(body.id)
  if (!id) return json({ error: "Missing pair." }, 400)
  const row = await env.DB.prepare(
    "SELECT before_src, after_src, caption, visible FROM pairs WHERE id = ?",
  )
    .bind(id)
    .first<PairRow>()
  if (!row) return json({ error: "Missing pair." }, 404)
  const caption = body.caption !== undefined ? String(body.caption).trim() : row.caption
  if (body.caption !== undefined && !caption) {
    return json({ error: "Pick a job type." }, 400)
  }
  let visible = row.visible
  if (body.visible !== undefined) {
    const on = body.visible === true || body.visible === 1
    if (on && !pairIsComplete(row)) {
      return json({ error: "Need a Before and an After before this pair can show." }, 400)
    }
    visible = on ? 1 : 0
  }
  await env.DB.prepare("UPDATE pairs SET caption = ?, visible = ? WHERE id = ?")
    .bind(caption, visible, id)
    .run()
  return json({ ok: true, visible })
}

export async function onRequestDelete({ request, env }: { request: Request; env: Env }) {
  const url = new URL(request.url)
  const id = Number(url.searchParams.get("id"))
  if (!id) return json({ error: "Missing pair." }, 400)
  const row = await env.DB.prepare("SELECT before_r2_key, after_r2_key FROM pairs WHERE id = ?")
    .bind(id)
    .first<{ before_r2_key: string | null; after_r2_key: string | null }>()
  await dropKey(env, row?.before_r2_key)
  await dropKey(env, row?.after_r2_key)
  await env.DB.prepare("DELETE FROM pairs WHERE id = ?").bind(id).run()
  return json({ ok: true })
}
