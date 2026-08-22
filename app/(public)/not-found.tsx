import Link from "next/link"

import { site } from "@/lib/site"

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-16 text-white">
      <h1 className="text-7xl">Wrong turn</h1>
      <p className="text-lg">That page is not here.</p>
      <Link href="/" className="cta cta-call w-fit">
        Home
      </Link>
      <a href={site.phoneTel} className="cta cta-mail w-fit">
        {site.ctaPrimary}
      </a>
    </div>
  )
}
