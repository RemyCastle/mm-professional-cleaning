export type LivePair = {
  id: number
  before_src: string
  after_src: string
  caption: string
  visible: number
}

/** Default is none. Never invent a before/after pair. */
export const fallbackPairs: LivePair[] = []

export function pairIsComplete(pair: {
  before_src?: string | null
  after_src?: string | null
}) {
  const before = String(pair.before_src || "").trim()
  const after = String(pair.after_src || "").trim()
  return Boolean(before && after && before !== after)
}

export function pairIsPublic(pair: {
  visible?: number | boolean | null
  before_src?: string | null
  after_src?: string | null
}) {
  return Boolean(pair.visible) && pairIsComplete(pair)
}
