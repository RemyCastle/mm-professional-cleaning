const ITERATIONS = 120000

function bufToB64(buf: ArrayBuffer | Uint8Array) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

function b64ToBuf(b64: string) {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function derive(password: string, salt: Uint8Array, iterations: number) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  )
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt.buffer as ArrayBuffer, iterations },
    key,
    256,
  )
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const bits = await derive(password, salt, ITERATIONS)
  return `pbkdf2$${ITERATIONS}$${bufToB64(salt)}$${bufToB64(bits)}`
}

export async function verifyPassword(password: string, stored: string) {
  const parts = stored.split("$")
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false
  const iterations = Number(parts[1])
  const salt = b64ToBuf(parts[2])
  const expected = b64ToBuf(parts[3])
  const bits = new Uint8Array(await derive(password, salt, iterations))
  if (bits.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < bits.length; i++) diff |= bits[i] ^ expected[i]
  return diff === 0
}
