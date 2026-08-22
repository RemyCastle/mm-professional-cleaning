"use client"

import { ContactActions } from "@/components/contact-actions"
import { ServiceLines } from "@/components/service-lines"

export function ServicesView() {
  return (
    <div className="bg-ground text-ink">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-6xl">Services</h1>
        <ServiceLines />
        <ContactActions className="mt-10 items-stretch sm:items-center" />
      </div>
    </div>
  )
}
