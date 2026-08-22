"use client"

import { useLive } from "@/components/live-public"
import { WorkCompares } from "@/components/work-compares"
import { WorkStack } from "@/components/work-stack"
import { phoneTel, photoIsPublic } from "@/lib/public"
import { pairIsPublic } from "@/lib/pairs"

export function WorkView() {
  const { site, photos, pairs } = useLive()
  const hasWork = photos.some(photoIsPublic) || pairs.some(pairIsPublic)
  return (
    <div className="bg-ground text-white">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-6xl">Work</h1>
        {hasWork ? (
          <>
            <WorkCompares />
            <WorkStack />
          </>
        ) : (
          <p className="mt-6 max-w-xl text-xl font-medium">Photos go here when we have them.</p>
        )}
        <a href={phoneTel(site.phone_display)} className="cta cta-call mt-10">
          {site.cta_primary}
        </a>
      </div>
    </div>
  )
}
