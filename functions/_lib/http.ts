export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  })
}

export function empty(status = 204) {
  return new Response(null, { status, headers: { "cache-control": "no-store" } })
}

export async function readJson<T>(request: Request): Promise<T> {
  return (await request.json()) as T
}
