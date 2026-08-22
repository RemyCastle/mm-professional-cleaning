export interface Env {
  DB: D1Database
  PHOTOS: R2Bucket
  SESSION_SECRET?: string
}

export const COOKIE = "mm_session"
export const FORM_SUBMIT = "https://formsubmit.co/ajax/m.mprofessionalcleaning@yahoo.com"
export const STATUSES = ["New", "Called", "Scheduled", "Done"] as const
