"use client"

import Link from "next/link"

import { useLive } from "@/components/live-public"
import { Wordmark } from "@/components/wordmark"
import { emailMailto, phoneTel } from "@/lib/public"

export function SiteFooter() {
  const { site } = useLive()
  return (
    <footer className="border-t border-ink/25 bg-ground text-ink">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-10">
        <Wordmark />
        <p className="max-w-2xl text-base font-semibold leading-relaxed">
          {site.towns}
          <br />
          <a
            href={phoneTel(site.phone_display)}
            className="underline decoration-hot underline-offset-4"
          >
            {site.phone_display}
          </a>
          <br />
          <a
            href={emailMailto(site.email)}
            className="underline decoration-hot underline-offset-4"
          >
            {site.email}
          </a>
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          <Link href="/" className="hover:text-hot">
            Home
          </Link>
          <Link href="/services/" className="hover:text-hot">
            Services
          </Link>
          <Link href="/work/" className="hover:text-hot">
            Work
          </Link>
          <a href="#quote" className="hover:text-hot">
            Quote
          </a>
        </div>
      </div>
    </footer>
  )
}
