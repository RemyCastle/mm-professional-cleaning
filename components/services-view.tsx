"use client"

import { useLive } from "@/components/live-public"
import { phoneTel } from "@/lib/public"
import { site as locked } from "@/lib/site"

export function ServicesView() {
  const { site, services } = useLive()
  return (
    <div className="bg-ground text-white">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-6xl">Services</h1>
        <ul className="mt-8 max-w-xl list-disc space-y-2 pl-5 text-xl font-medium marker:text-hot">
          {services.map((service) => (
            <li key={service.slug}>{service.name}</li>
          ))}
        </ul>
        <p className="mt-4 text-base font-medium text-white/80">{locked.moreLine}</p>
        <a href={phoneTel(site.phone_display)} className="cta cta-call mt-10">
          {site.cta_primary}
        </a>
      </div>
    </div>
  )
}
