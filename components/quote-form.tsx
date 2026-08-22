"use client"

import { useState } from "react"

import { useLive } from "@/components/live-public"

export function QuoteForm() {
  const { site } = useLive()
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle")
  const [message, setMessage] = useState("")

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("sending")
    const form = event.currentTarget
    const data = new FormData(form)
    const phone = String(data.get("phone") || "").trim()
    const email = String(data.get("email") || "").trim()
    if (!phone && !email) {
      setStatus("err")
      setMessage("Add a phone or an email.")
      return
    }
    try {
      const res = await fetch("/api/leads", { method: "POST", body: data })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus("err")
        setMessage(body.error || "Could not send.")
        return
      }
      form.reset()
      setStatus("ok")
      setMessage("Sent. We will get back to you.")
    } catch {
      setStatus("err")
      setMessage("Could not send.")
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-4" encType="multipart/form-data">
      <label className="flex flex-col gap-1 text-sm font-extrabold uppercase tracking-wide">
        Name
        <input id="quote-name" name="name" autoComplete="name" required className="field-ink" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-extrabold uppercase tracking-wide">
        Phone
        <input
          id="quote-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className="field-ink"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-extrabold uppercase tracking-wide">
        Email
        <input
          id="quote-email"
          name="email"
          type="email"
          autoComplete="email"
          className="field-ink"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-extrabold uppercase tracking-wide">
        Message
        <textarea id="quote-job" name="need" required rows={4} className="field-ink" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-extrabold uppercase tracking-wide">
        {site.quote_photos}
        <input
          id="quote-photos"
          name="attachment"
          type="file"
          accept="image/*"
          multiple
          className="field-ink py-2"
        />
      </label>
      <button type="submit" className="cta cta-call w-fit" disabled={status === "sending"}>
        {status === "sending" ? "Sending" : site.quote_submit}
      </button>
      <p className="text-sm font-semibold">{site.quote_helper}</p>
      {message ? <p className="text-sm font-extrabold">{message}</p> : null}
    </form>
  )
}
