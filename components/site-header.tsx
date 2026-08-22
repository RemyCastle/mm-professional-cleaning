"use client"

import Link from "next/link"

import { BrandMark } from "@/components/brand-mark"
import { useLive } from "@/components/live-public"
import { phoneTel } from "@/lib/public"

const nav = [
  { href: "/", label: "Home" },
  { href: "/services/", label: "Services" },
  { href: "/work/", label: "Work" },
]

export function SiteHeader() {
  const { site } = useLive()
  return (
    <header className="sticky top-0 z-40 bg-ground text-white">
      <div className="stripe" />
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2">
        <Link href="/" className="shrink-0">
          <BrandMark priority />
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-extrabold uppercase tracking-wider md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-hot">
              {item.label}
            </Link>
          ))}
          <a href="#quote" className="hover:text-hot">
            Quote
          </a>
        </nav>
        <a
          href={phoneTel(site.phone_display)}
          className="cta cta-call"
          style={{ minHeight: "2.75rem", fontSize: "1.05rem" }}
        >
          {site.cta_primary}
        </a>
      </div>
      <nav className="flex items-center justify-around border-t border-white/30 px-2 py-2 text-xs font-extrabold uppercase tracking-wider md:hidden">
        {nav.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        <a href="#quote">Quote</a>
      </nav>
    </header>
  )
}
