import type { Metadata } from "next"

import { WorkView } from "@/components/work-view"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Work",
  description: site.seoDescription,
  alternates: { canonical: "/work/" },
}

export default function WorkPage() {
  return <WorkView />
}
