import type { Env } from "../../_lib/env"
import { json } from "../../_lib/http"
import { ready } from "../../_lib/ready"
import { pairIsPublic } from "../../_lib/pairs"

export async function onRequestGet({ env }: { env: Env }) {
  try {
    await ready(env)
    const rows = await env.DB.prepare(
      `SELECT id, before_src, after_src, caption, visible, sort_order
       FROM pairs ORDER BY sort_order, id`,
    ).all<{
      id: number
      before_src: string
      after_src: string
      caption: string
      visible: number
      sort_order: number
    }>()
    const pairs = (rows.results || []).filter(pairIsPublic)
    return json({ pairs })
  } catch {
    return json({ pairs: [] })
  }
}
