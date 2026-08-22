"use client"

import { useLive } from "@/components/live-public"
import { emailMailto, phoneTel } from "@/lib/public"

export function ThumbDock() {
  const { site } = useLive()
  return (
    <nav
      data-thumb-dock
      aria-label="Call or email"
      className="fixed inset-x-0 bottom-0 z-50 border-t-4 border-hot bg-ground text-white pb-[env(safe-area-inset-bottom,0px)] md:hidden"
    >
      <div className="grid grid-cols-2">
        <a
          href={phoneTel(site.phone_display)}
          className="flex min-h-16 flex-col items-center justify-center bg-hot px-1 py-2 text-center text-ink"
        >
          <span className="text-xl font-extrabold uppercase leading-none">Call</span>
          <span className="text-[10px] font-extrabold">{site.phone_display}</span>
        </a>
        <a
          href={emailMailto(site.email)}
          className="flex min-h-16 flex-col items-center justify-center border-l-2 border-hot px-1 py-2 text-center"
        >
          <span className="text-xl font-extrabold uppercase leading-none">Email</span>
        </a>
      </div>
    </nav>
  )
}
