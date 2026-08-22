import { STATUSES, type Env } from "../../_lib/env"
import { json } from "../../_lib/http"

type LeadRow = {
  id: number
  created_at: string
  name: string
  phone: string
  email: string
  need: string
  has_photos: number
  photo_note: string | null
  status: string
}

async function filesFor(env: Env, id: number) {
  try {
    const listed = await env.PHOTOS.list({ prefix: `leads/${id}/` })
    return (listed.objects || []).map((obj) => {
      const name = obj.key.split("/").pop() || obj.key
      return `/api/media/lead/${id}/${encodeURIComponent(name)}`
    })
  } catch {
    return []
  }
}

export async function onRequestGet({ env }: { env: Env }) {
  const rows = await env.DB.prepare(
    "SELECT id, created_at, name, phone, email, need, has_photos, photo_note, status FROM leads ORDER BY id DESC",
  ).all<LeadRow>()
  const leads = []
  for (const lead of rows.results || []) {
    leads.push({
      ...lead,
      files: lead.has_photos ? await filesFor(env, lead.id) : [],
    })
  }
  return json({ leads })
}

export async function onRequestPatch({ request, env }: { request: Request; env: Env }) {
  const body = (await request.json()) as { id?: number; status?: string }
  const id = Number(body.id)
  const status = String(body.status || "")
  if (!id || !STATUSES.includes(status as (typeof STATUSES)[number])) {
    return json({ error: "Bad status." }, 400)
  }
  await env.DB.prepare("UPDATE leads SET status = ? WHERE id = ?").bind(status, id).run()
  return json({ ok: true })
}
