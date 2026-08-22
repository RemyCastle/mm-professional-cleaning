"use client"

import { useLive } from "@/components/live-public"
import { serviceBlurb } from "@/lib/public"

export function ServiceLines() {
  const { services } = useLive()
  return (
    <ul className="mt-8 max-w-xl space-y-4 text-xl font-medium">
      {services.map((service) => {
        const blurb = serviceBlurb(service)
        return (
          <li key={service.slug}>
            <span className="font-extrabold">{service.name}</span>
            {blurb ? ` — ${blurb}` : null}
          </li>
        )
      })}
    </ul>
  )
}
