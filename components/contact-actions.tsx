"use client"

import { useLive } from "@/components/live-public"
import { emailMailto, phoneSms, phoneTel } from "@/lib/public"
import { site as locked } from "@/lib/site"
import { cn } from "@/lib/utils"

export function ContactActions({ className }: { className?: string }) {
  const { site } = useLive()
  return (
    <div className={cn("flex w-full flex-col items-center gap-3 sm:max-w-sm", className)}>
      <a href={phoneTel(site.phone_display)} className="cta cta-call w-full">
        {site.cta_primary}
      </a>
      <a href={phoneSms(site.phone_display)} className="cta cta-mail w-full">
        {site.cta_secondary}
      </a>
      <a href={emailMailto(site.email)} className="cta cta-mail w-full">
        {locked.ctaEmail}
      </a>
    </div>
  )
}
