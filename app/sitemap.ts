import type { MetadataRoute } from "next"

import { site } from "@/lib/site"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.siteUrl}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${site.siteUrl}/services/`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${site.siteUrl}/work/`, changeFrequency: "monthly", priority: 0.6 },
  ]
}
