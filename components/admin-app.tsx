"use client"

/* eslint-disable react-hooks/set-state-in-effect -- admin boot and job-type fields match the Sharky/Solid Craft pattern */

import { useCallback, useEffect, useState } from "react"

import { BrandMark } from "@/components/brand-mark"
import { pairIsComplete, type LivePair } from "@/lib/pairs"
import type { LivePhoto, LiveService, LiveSite } from "@/lib/public"

type Tab = "site" | "requests" | "photos" | "users"
type Admin = { id: number; name: string }
type Lead = {
  id: number
  created_at: string
  name: string
  phone: string
  email: string
  need: string
  has_photos: number
  photo_note: string | null
  status: string
  files?: string[]
}
type UserRow = { id: number; name: string; created_at: string }

const TABS: { id: Tab; label: string }[] = [
  { id: "site", label: "Site" },
  { id: "requests", label: "Requests" },
  { id: "photos", label: "Photos" },
  { id: "users", label: "Users" },
]
const STATUSES = ["New", "Called", "Scheduled", "Done"]

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...init })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || "Request failed")
  return body as T
}

export function AdminApp() {
  const [boot, setBoot] = useState<"load" | "setup" | "login" | "in">("load")
  const [me, setMe] = useState<Admin | null>(null)
  const [tab, setTab] = useState<Tab>("site")
  const [note, setNote] = useState("")

  const refreshMe = useCallback(async () => {
    const data = await api<{ setup: boolean; admin: Admin | null }>("/api/auth/me")
    if (data.setup) setBoot("setup")
    else if (data.admin) {
      setMe(data.admin)
      setBoot("in")
    } else setBoot("login")
  }, [])

  useEffect(() => {
    refreshMe().catch(() => setBoot("login"))
  }, [refreshMe])

  if (boot === "load") {
    return <AdminShell>Loading…</AdminShell>
  }
  if (boot === "setup") {
    return (
      <AdminShell>
        <h1 className="text-5xl">Create owner</h1>
        <p className="mt-3 max-w-md font-semibold">
          First time only. Bookmark /admin. Not linked from the public site.
        </p>
        <AuthForm
          action="/api/auth/setup"
          submit="Create owner"
          onDone={refreshMe}
        />
      </AdminShell>
    )
  }
  if (boot === "login") {
    return (
      <AdminShell>
        <h1 className="text-5xl">Admin</h1>
        <AuthForm action="/api/auth/login" submit="Sign in" onDone={refreshMe} />
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-5xl">Admin</h1>
          <p className="mt-1 font-extrabold">{me?.name}</p>
        </div>
        <button
          type="button"
          className="cta cta-mail"
          style={{ minHeight: "44px" }}
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
            setMe(null)
            setBoot("login")
          }}
        >
          Sign out
        </button>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === tab ? "admin-tab admin-tab-on" : "admin-tab"}
            onClick={() => {
              setTab(item.id)
              setNote("")
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      {note ? <p className="mt-4 font-extrabold">{note}</p> : null}
      {tab === "site" ? <SiteTab onNote={setNote} /> : null}
      {tab === "requests" ? <RequestsTab onNote={setNote} /> : null}
      {tab === "photos" ? <PhotosTab onNote={setNote} /> : null}
      {tab === "users" ? <UsersTab me={me} onNote={setNote} /> : null}
    </AdminShell>
  )
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 text-white">
      <div className="stripe -mx-4" />
      <BrandMark />
      {children}
    </div>
  )
}

function AuthForm({
  action,
  submit,
  onDone,
}: {
  action: string
  submit: string
  onDone: () => void
}) {
  const [error, setError] = useState("")
  return (
    <form
      className="mt-6 flex max-w-md flex-col gap-3"
      onSubmit={async (event) => {
        event.preventDefault()
        setError("")
        const form = new FormData(event.currentTarget)
        try {
          await api(action, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              name: form.get("name"),
              password: form.get("password"),
            }),
          })
          onDone()
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed")
        }
      }}
    >
      <label className="flex flex-col gap-1 text-sm font-extrabold uppercase">
        Name
        <input name="name" required className="field-ink" autoComplete="username" />
      </label>
      <label className="flex flex-col gap-1 text-sm font-extrabold uppercase">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="field-ink"
          autoComplete={submit === "Sign in" ? "current-password" : "new-password"}
        />
      </label>
      <button type="submit" className="cta cta-call w-fit" style={{ minHeight: "44px" }}>
        {submit}
      </button>
      {error ? <p className="font-extrabold">{error}</p> : null}
    </form>
  )
}

function SiteTab({ onNote }: { onNote: (n: string) => void }) {
  const [site, setSite] = useState<LiveSite | null>(null)
  const [services, setServices] = useState<LiveService[]>([])
  useEffect(() => {
    api<{ site: LiveSite; services: LiveService[] }>("/api/admin/site")
      .then((data) => {
        setSite(data.site)
        setServices(data.services)
      })
      .catch((err) => onNote(err.message))
  }, [onNote])
  if (!site) return <p className="mt-6">Loading site…</p>
  const field = (key: keyof LiveSite, label: string, rows = 1) => (
    <label className="flex flex-col gap-1 text-sm font-extrabold uppercase">
      {label}
      {rows > 1 ? (
        <textarea
          className="field-ink"
          rows={rows}
          value={site[key]}
          onChange={(e) => setSite({ ...site, [key]: e.target.value })}
        />
      ) : (
        <input
          className="field-ink"
          value={site[key]}
          onChange={(e) => setSite({ ...site, [key]: e.target.value })}
        />
      )}
    </label>
  )
  return (
    <form
      className="mt-6 flex max-w-xl flex-col gap-3"
      onSubmit={async (event) => {
        event.preventDefault()
        try {
          await api("/api/admin/site", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ site, services }),
          })
          onNote("Site saved. Public page will pick it up.")
        } catch (err) {
          onNote(err instanceof Error ? err.message : "Save failed")
        }
      }}
    >
      {field("hero_title", "Hero title", 2)}
      {field("hero_lead", "Lead", 3)}
      {field("about", "About (one sentence per line)", 5)}
      {field("phone_display", "Phone")}
      {field("email", "Email")}
      {field("towns", "Towns / service area")}
      {field("cta_primary", "Primary CTA")}
      {field("cta_secondary", "Secondary CTA")}
      {field("quote_heading", "Quote heading")}
      {field("quote_submit", "Quote submit")}
      {field("quote_photos", "Quote photos label")}
      {field("quote_helper", "Quote helper")}
      <h2 className="mt-4 text-4xl">Services</h2>
      {services.map((row, index) => (
        <div key={`${row.slug}-${index}`} className="vinyl flex flex-col gap-2 p-3">
          <input
            className="field-ink"
            value={row.name}
            onChange={(e) => {
              const next = [...services]
              next[index] = { ...row, name: e.target.value }
              setServices(next)
            }}
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="admin-mini" onClick={() => {
              if (index === 0) return
              const next = [...services]
              ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
              setServices(next)
            }}>Up</button>
            <button type="button" className="admin-mini" onClick={() => {
              if (index === services.length - 1) return
              const next = [...services]
              ;[next[index + 1], next[index]] = [next[index], next[index + 1]]
              setServices(next)
            }}>Down</button>
            <button type="button" className="admin-mini" onClick={() => {
              setServices(services.filter((_, i) => i !== index))
            }}>Remove</button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="cta cta-mail w-fit"
        style={{ minHeight: "44px" }}
        onClick={() => setServices([...services, { slug: `service-${services.length + 1}`, name: "New service" }])}
      >
        Add service
      </button>
      <button type="submit" className="cta cta-call w-fit" style={{ minHeight: "44px" }}>
        Save site
      </button>
    </form>
  )
}

function RequestsTab({ onNote }: { onNote: (n: string) => void }) {
  const [leads, setLeads] = useState<Lead[]>([])
  const load = useCallback(() => {
    api<{ leads: Lead[] }>("/api/admin/leads")
      .then((data) => setLeads(data.leads))
      .catch((err) => onNote(err.message))
  }, [onNote])
  useEffect(() => {
    load()
  }, [load])
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[40rem] border-4 border-ink bg-white text-left text-sm text-ink">
        <thead className="bg-hot text-ink">
          <tr>
            {["When", "Name", "Phone", "Email", "Message", "Photos", "Status"].map((h) => (
              <th key={h} className="border-2 border-ink px-2 py-2 font-extrabold uppercase">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td className="border-2 border-ink px-2 py-2">{lead.created_at}</td>
              <td className="border-2 border-ink px-2 py-2">{lead.name}</td>
              <td className="border-2 border-ink px-2 py-2">{lead.phone || "—"}</td>
              <td className="border-2 border-ink px-2 py-2">{lead.email || "—"}</td>
              <td className="border-2 border-ink px-2 py-2">{lead.need}</td>
              <td className="border-2 border-ink px-2 py-2">
                {lead.files?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {lead.files.map((src) => (
                      <a key={src} href={src} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="h-16 w-16 object-cover" />
                      </a>
                    ))}
                  </div>
                ) : lead.has_photos ? (
                  lead.photo_note || "Yes"
                ) : (
                  "No"
                )}
              </td>
              <td className="border-2 border-ink px-2 py-2">
                <select
                  className="field-ink min-h-11"
                  value={lead.status}
                  onChange={async (event) => {
                    const status = event.target.value
                    try {
                      await api("/api/admin/leads", {
                        method: "PATCH",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ id: lead.id, status }),
                      })
                      setLeads(leads.map((row) => (row.id === lead.id ? { ...row, status } : row)))
                    } catch (err) {
                      onNote(err instanceof Error ? err.message : "Status failed")
                    }
                  }}
                >
                  {STATUSES.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {leads.length === 0 ? <p className="mt-4 font-semibold">No requests yet.</p> : null}
    </div>
  )
}

function JobTypeFields({
  services,
  value,
  onChange,
  onBlur,
}: {
  services: LiveService[]
  value?: string
  onChange?: (caption: string) => void
  onBlur?: () => void
}) {
  const [caption, setCaption] = useState(value ?? "")
  const [customOn, setCustomOn] = useState(
    () => Boolean(value) && !services.some((service) => service.name === value),
  )
  useEffect(() => {
    if (value === undefined) return
    setCaption(value)
    setCustomOn(Boolean(value) && !services.some((service) => service.name === value))
  }, [value, services])
  function emit(next: string) {
    setCaption(next)
    onChange?.(next)
  }
  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1 text-sm font-extrabold uppercase">
        Job type
        <select
          className="field-ink"
          value={customOn ? "__custom" : caption}
          required={!customOn}
          onChange={(event) => {
            if (event.target.value === "__custom") {
              setCustomOn(true)
              emit("")
              return
            }
            setCustomOn(false)
            emit(event.target.value)
          }}
          onBlur={onBlur}
        >
          <option value="">Pick a job</option>
          {services.map((service) => (
            <option key={service.slug || service.name} value={service.name}>
              {service.name}
            </option>
          ))}
          <option value="__custom">Other</option>
        </select>
      </label>
      {customOn ? (
        <input
          name="caption"
          className="field-ink"
          required
          placeholder="Job title"
          value={caption}
          onChange={(event) => emit(event.target.value)}
          onBlur={onBlur}
        />
      ) : (
        <input type="hidden" name="caption" value={caption} />
      )}
    </div>
  )
}

function PairsBlock({
  onNote,
  services,
}: {
  onNote: (n: string) => void
  services: LiveService[]
}) {
  const [pairs, setPairs] = useState<LivePair[]>([])
  const load = useCallback(() => {
    api<{ pairs: LivePair[] }>("/api/admin/pairs")
      .then((data) => setPairs(data.pairs || []))
      .catch((err) => onNote(err.message))
  }, [onNote])
  useEffect(() => {
    load()
  }, [load])
  async function saveOrder(next: LivePair[]) {
    setPairs(next)
    await api("/api/admin/pairs", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ order: next.map((pair) => pair.id) }),
    })
  }
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-4xl">Before and After</h2>
        <p className="mt-2 font-semibold">
          Optional. Public Work only shows a pair when both photos are in and Show on Work is on.
          Zero pairs is fine. Use a real before and a real after of the same job. Do not reuse one
          photo as both sides.
        </p>
      </div>
      <form
        className="vinyl flex flex-col gap-3 p-4"
        onSubmit={async (event) => {
          event.preventDefault()
          const form = event.currentTarget
          const data = new FormData(form)
          if (!(data.get("before") instanceof File) || !(data.get("after") instanceof File)) {
            onNote("Need a Before and an After.")
            return
          }
          try {
            const created = await api<{ visible: number }>("/api/admin/pairs", {
              method: "POST",
              body: data,
            })
            form.reset()
            onNote(
              created.visible
                ? "Pair is on Work."
                : "Pair saved. Off Work until you turn Show on Work on.",
            )
            load()
          } catch (err) {
            onNote(err instanceof Error ? err.message : "Upload failed")
          }
        }}
      >
        <label className="flex flex-col gap-1 text-sm font-extrabold uppercase">
          Before
          <input name="before" type="file" accept="image/*" required className="field-ink py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-extrabold uppercase">
          After
          <input name="after" type="file" accept="image/*" required className="field-ink py-2" />
        </label>
        <JobTypeFields services={services} />
        <label className="flex items-center gap-2 font-extrabold">
          <input name="visible" type="checkbox" value="1" className="size-5 accent-hot" />
          Show on Work
        </label>
        <button type="submit" className="cta cta-call w-fit" style={{ minHeight: "44px" }}>
          Add pair
        </button>
      </form>
      {pairs.length === 0 ? (
        <p className="font-semibold">No pairs yet. Work stays a photo stack.</p>
      ) : null}
      {pairs.map((pair, index) => {
        const complete = pairIsComplete(pair)
        return (
          <article key={pair.id} className="vinyl overflow-hidden">
            <div className="grid grid-cols-2">
              <div className="border-r-4 border-ink">
                {pair.before_src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pair.before_src} alt="Before" className="h-auto w-full" />
                ) : (
                  <p className="p-3 font-extrabold">Missing Before</p>
                )}
                <p className="border-t-4 border-ink px-2 py-1 text-sm font-extrabold uppercase">
                  Before
                </p>
              </div>
              <div>
                {pair.after_src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={pair.after_src} alt="After" className="h-auto w-full" />
                ) : (
                  <p className="p-3 font-extrabold">Missing After</p>
                )}
                <p className="border-t-4 border-ink px-2 py-1 text-sm font-extrabold uppercase">
                  After
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 border-t-4 border-ink p-3">
              {!complete ? (
                <p className="font-extrabold">Hidden on Work — this pair is missing a photo.</p>
              ) : null}
              <JobTypeFields
                services={services}
                value={pair.caption}
                onChange={(caption) => {
                  const next = [...pairs]
                  next[index] = { ...pair, caption }
                  setPairs(next)
                }}
                onBlur={async () => {
                  if (!pair.caption.trim()) return
                  await api("/api/admin/pairs", {
                    method: "PATCH",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ id: pair.id, caption: pair.caption }),
                  })
                }}
              />
              <label className="flex items-center gap-2 font-extrabold">
                <input
                  type="checkbox"
                  className="size-5 accent-hot"
                  checked={Boolean(pair.visible) && complete}
                  disabled={!complete}
                  onChange={async (event) => {
                    const visible = event.target.checked ? 1 : 0
                    try {
                      await api("/api/admin/pairs", {
                        method: "PATCH",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ id: pair.id, visible }),
                      })
                      const next = [...pairs]
                      next[index] = { ...pair, visible }
                      setPairs(next)
                    } catch (err) {
                      onNote(err instanceof Error ? err.message : "Could not update")
                    }
                  }}
                />
                Show on Work
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="admin-mini"
                  onClick={() => {
                    if (index === 0) return
                    const next = [...pairs]
                    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
                    saveOrder(next).catch((err) => onNote(err.message))
                  }}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="admin-mini"
                  onClick={() => {
                    if (index === pairs.length - 1) return
                    const next = [...pairs]
                    ;[next[index + 1], next[index]] = [next[index], next[index + 1]]
                    saveOrder(next).catch((err) => onNote(err.message))
                  }}
                >
                  Down
                </button>
                <button
                  type="button"
                  className="admin-mini"
                  onClick={async () => {
                    await api(`/api/admin/pairs?id=${pair.id}`, { method: "DELETE" })
                    load()
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function PhotosTab({ onNote }: { onNote: (n: string) => void }) {
  const [photos, setPhotos] = useState<LivePhoto[]>([])
  const [services, setServices] = useState<LiveService[]>([])
  const load = useCallback(() => {
    Promise.all([
      api<{ photos: LivePhoto[] }>("/api/admin/photos"),
      api<{ services: LiveService[] }>("/api/admin/site"),
    ])
      .then(([photoData, siteData]) => {
        setPhotos(photoData.photos)
        setServices(siteData.services || [])
      })
      .catch((err) => onNote(err.message))
  }, [onNote])
  useEffect(() => {
    load()
  }, [load])
  async function saveOrder(next: LivePhoto[]) {
    setPhotos(next)
    await api("/api/admin/photos", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ order: next.map((p) => p.id) }),
    })
  }
  return (
    <div className="mt-6 flex max-w-xl flex-col gap-4">
      <PairsBlock onNote={onNote} services={services} />
      <h2 className="mt-4 text-4xl">Work stills</h2>
      <p className="font-semibold">
        Pick the job type. No photo means it stays off Work. Do not invent a title.
      </p>
      <form
        className="vinyl flex flex-col gap-3 p-4"
        onSubmit={async (event) => {
          event.preventDefault()
          const form = event.currentTarget
          const data = new FormData(form)
          try {
            const created = await api<{ src: string }>("/api/admin/photos", { method: "POST", body: data })
            form.reset()
            onNote(created.src ? "Photo added." : "Saved. Hidden on Work until you add a photo.")
            load()
          } catch (err) {
            onNote(err instanceof Error ? err.message : "Upload failed")
          }
        }}
      >
        <JobTypeFields services={services} />
        <label className="flex flex-col gap-1 text-sm font-extrabold uppercase">
          Photo
          <input name="file" type="file" accept="image/*" className="field-ink py-2" />
        </label>
        <button type="submit" className="cta cta-call w-fit" style={{ minHeight: "44px" }}>
          Save still
        </button>
      </form>
      {photos.map((photo, index) => (
        <figure key={photo.id ?? photo.src} className="vinyl overflow-hidden">
          {photo.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.src} alt={photo.alt || photo.caption} className="h-auto w-full" />
          ) : (
            <p className="p-3 font-extrabold">Hidden on Work — no photo yet.</p>
          )}
          <figcaption className="flex flex-col gap-2 border-t-4 border-ink p-3">
            <JobTypeFields
              services={services}
              value={photo.caption}
              onChange={(caption) => {
                const next = [...photos]
                next[index] = { ...photo, caption, alt: caption }
                setPhotos(next)
              }}
              onBlur={async () => {
                if (!photo.id || !photo.caption.trim()) return
                await api("/api/admin/photos", {
                  method: "PATCH",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ id: photo.id, caption: photo.caption, alt: photo.caption }),
                })
              }}
            />
            {!photo.src && photo.id ? (
              <form
                className="flex flex-col gap-2"
                onSubmit={async (event) => {
                  event.preventDefault()
                  const data = new FormData(event.currentTarget)
                  data.set("id", String(photo.id))
                  try {
                    await api("/api/admin/photos", { method: "POST", body: data })
                    onNote("Photo added.")
                    load()
                  } catch (err) {
                    onNote(err instanceof Error ? err.message : "Upload failed")
                  }
                }}
              >
                <input name="file" type="file" accept="image/*" required className="field-ink py-2" />
                <button type="submit" className="admin-mini">
                  Add photo
                </button>
              </form>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button type="button" className="admin-mini" onClick={() => {
                if (index === 0) return
                const next = [...photos]
                ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
                saveOrder(next).catch((err) => onNote(err.message))
              }}>Up</button>
              <button type="button" className="admin-mini" onClick={() => {
                if (index === photos.length - 1) return
                const next = [...photos]
                ;[next[index + 1], next[index]] = [next[index], next[index + 1]]
                saveOrder(next).catch((err) => onNote(err.message))
              }}>Down</button>
              <button type="button" className="admin-mini" onClick={async () => {
                if (!photo.id) return
                await api(`/api/admin/photos?id=${photo.id}`, { method: "DELETE" })
                load()
              }}>Remove</button>
            </div>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

function UsersTab({ me, onNote }: { me: Admin | null; onNote: (n: string) => void }) {
  const [users, setUsers] = useState<UserRow[]>([])
  const load = useCallback(() => {
    api<{ users: UserRow[] }>("/api/admin/users")
      .then((data) => setUsers(data.users))
      .catch((err) => onNote(err.message))
  }, [onNote])
  useEffect(() => {
    load()
  }, [load])
  return (
    <div className="mt-6 flex max-w-md flex-col gap-6">
      <ul className="flex flex-col gap-2">
        {users.map((user) => (
          <li key={user.id} className="vinyl flex items-center justify-between gap-3 p-3">
            <span className="font-extrabold">{user.name}</span>
            <button
              type="button"
              className="admin-mini"
              onClick={async () => {
                try {
                  const data = await api<{ users: UserRow[] }>(`/api/admin/users?id=${user.id}`, {
                    method: "DELETE",
                  })
                  setUsers(data.users)
                } catch (err) {
                  onNote(err instanceof Error ? err.message : "Cannot remove")
                }
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form
        className="flex flex-col gap-3"
        onSubmit={async (event) => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)
          try {
            const data = await api<{ users: UserRow[] }>("/api/admin/users", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                name: form.get("name"),
                password: form.get("password"),
              }),
            })
            event.currentTarget.reset()
            setUsers(data.users)
            onNote("Admin added.")
          } catch (err) {
            onNote(err instanceof Error ? err.message : "Add failed")
          }
        }}
      >
        <h2 className="text-4xl">Add admin</h2>
        <input name="name" required className="field-ink" placeholder="Name" />
        <input name="password" type="password" required minLength={8} className="field-ink" placeholder="Password" />
        <button type="submit" className="cta cta-call w-fit" style={{ minHeight: "44px" }}>
          Add
        </button>
      </form>
      <form
        className="flex flex-col gap-3"
        onSubmit={async (event) => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)
          try {
            await api("/api/admin/users", {
              method: "PATCH",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                current: form.get("current"),
                password: form.get("password"),
              }),
            })
            event.currentTarget.reset()
            onNote(`Password changed for ${me?.name}.`)
          } catch (err) {
            onNote(err instanceof Error ? err.message : "Password failed")
          }
        }}
      >
        <h2 className="text-4xl">Your password</h2>
        <input name="current" type="password" required className="field-ink" placeholder="Current password" />
        <input name="password" type="password" required minLength={8} className="field-ink" placeholder="New password" />
        <button type="submit" className="cta cta-mail w-fit" style={{ minHeight: "44px" }}>
          Change password
        </button>
      </form>
    </div>
  )
}
