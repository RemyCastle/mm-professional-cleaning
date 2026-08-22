export function photoIsPublic(photo: { src?: string | null }) {
  return Boolean(String(photo.src || "").trim())
}

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
