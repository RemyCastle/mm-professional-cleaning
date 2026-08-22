import { json } from "../../_lib/http"
import { clearCookie } from "../../_lib/session"

export async function onRequestPost({ request }: { request: Request }) {
  const res = json({ ok: true })
  res.headers.set("set-cookie", clearCookie(new URL(request.url).protocol === "https:"))
  return res
}
