import { COOKIE, type Env } from "./env"

export type AdminRow = { id: number; name: string }

function b64url(data: string) {
  return btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function unb64url(data: string) {
  const pad = data.length % 4 === 0 ? "" : "=".repeat(4 - (data.length % 4))
  return atob(data.replace(/-/g, "+").replace(/_/g, "/") + pad)
}

async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value))
  return b64url(String.fromCharCode(...new Uint8Array(sig)))
}

export function cookieHeader(token: string, secure: boolean) {
  const parts = [
    `${COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=604800",
  ]
  if (secure) parts.push("Secure")
  return parts.join("; ")
}

export function clearCookie(secure: boolean) {
  const parts = [`${COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"]
  if (secure) parts.push("Secure")
  return parts.join("; ")
}

export async function signSession(secret: string, admin: AdminRow) {
  const payload = b64url(
    JSON.stringify({ id: admin.id, name: admin.name, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }),
  )
  const sig = await hmac(secret, payload)
  return `${payload}.${sig}`
}

export async function readSession(request: Request, env: Env): Promise<AdminRow | null> {
  const secret = env.SESSION_SECRET
  if (!secret) return null
  const raw = request.headers.get("Cookie") || ""
  const match = raw.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))
  if (!match) return null
  const [payload, sig] = match[1].split(".")
  if (!payload || !sig) return null
  const expected = await hmac(secret, payload)
  if (expected.length !== sig.length) return null
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  if (diff !== 0) return null
  try {
    const data = JSON.parse(unb64url(payload)) as { id: number; name: string; exp: number }
    if (!data.exp || data.exp < Date.now()) return null
    return { id: data.id, name: data.name }
  } catch {
    return null
  }
}
