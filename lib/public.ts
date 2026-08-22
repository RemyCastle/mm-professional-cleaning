import { fallbackPairs, type LivePair } from "@/lib/pairs"
import { jobPhotos, services, site } from "@/lib/site"

export type { LivePair }
export { fallbackPairs }

export type LiveSite = {
  hero_title: string
  hero_lead: string
  about: string
  phone_display: string
  email: string
  towns: string
  cta_primary: string
  cta_secondary: string
  quote_heading: string
  quote_submit: string
  quote_photos: string
  quote_helper: string
}

export type LiveService = { id?: number; slug: string; name: string; blurb?: string }
export type LivePhoto = {
  id?: number
  src: string
  alt: string
  caption: string
  width: number
  height: number
}

export type LiveReview = {
  id: number
  name: string
  stars: number
  text: string
}

export const fallbackSite: LiveSite = {
  hero_title: site.heroTitle,
  hero_lead: site.heroLead,
  about: site.about,
  phone_display: site.phoneDisplay,
  email: site.email,
  towns: site.towns,
  cta_primary: site.ctaPrimary,
  cta_secondary: site.ctaSecondary,
  quote_heading: site.quoteHeading,
  quote_submit: site.quoteSubmit,
  quote_photos: site.quotePhotos,
  quote_helper: site.quoteHelper,
}

export const fallbackServices: LiveService[] = services.map((row) => ({
  slug: row.slug,
  name: row.name,
  blurb: row.blurb,
}))

export const fallbackPhotos: LivePhoto[] = jobPhotos.map((row) => ({
  src: row.src,
  alt: row.alt,
  caption: row.caption,
  width: row.width,
  height: row.height,
}))

export const fallbackReviews: LiveReview[] = []

export function photoIsPublic(photo: { src?: string | null }) {
  return Boolean(String(photo.src || "").trim())
}

export function livePhotos(rows?: LivePhoto[] | null) {
  const shown = (Array.isArray(rows) ? rows : []).filter(photoIsPublic)
  return shown.length ? shown : fallbackPhotos
}

export function reviewIsPublic(review: { name?: string; text?: string; stars?: number }) {
  const name = String(review.name || "").trim()
  const text = String(review.text || "").trim()
  const stars = Number(review.stars)
  return Boolean(name && text && Number.isInteger(stars) && stars >= 1 && stars <= 5)
}

export function featuredReviews(rows: LiveReview[]) {
  return rows
    .filter(reviewIsPublic)
    .slice()
    .sort((a, b) => b.stars - a.stars || b.id - a.id)
}

export function phoneTel(display: string) {
  const digits = display.replace(/\D/g, "")
  if (digits.length === 10) return `tel:+1${digits}`
  if (digits.length === 11 && digits.startsWith("1")) return `tel:+${digits}`
  return site.phoneTel
}

export function emailMailto(email: string) {
  return `mailto:${email}`
}

export function phoneSms(display: string) {
  const digits = display.replace(/\D/g, "")
  if (digits.length === 10) return `sms:+1${digits}`
  if (digits.length === 11 && digits.startsWith("1")) return `sms:+${digits}`
  return site.phoneSms
}

export function serviceBlurb(service: { slug?: string; name: string; blurb?: string }) {
  if (service.blurb) return service.blurb
  const hit = services.find((row) => row.slug === service.slug || row.name === service.name)
  return hit?.blurb || ""
}

export function aboutLines(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
}
