"use client"

import { useLive } from "@/components/live-public"
import { QuoteForm } from "@/components/quote-form"

export function QuoteBlock() {
  const { site } = useLive()
  return (
    <section id="quote" className="border-t border-white/25 bg-ground">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-5xl">{site.quote_heading}</h2>
        <div className="mt-8">
          <QuoteForm />
        </div>
      </div>
    </section>
  )
}
