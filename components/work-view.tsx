"use client"

import { ContactActions } from "@/components/contact-actions"
import { useLive } from "@/components/live-public"
import { WorkCompares } from "@/components/work-compares"
import { WorkStack } from "@/components/work-stack"
import { photoIsPublic } from "@/lib/public"
import { pairIsPublic } from "@/lib/pairs"

export function WorkView() {
  const { photos, pairs } = useLive()
  const hasWork = photos.some(photoIsPublic) || pairs.some(pairIsPublic)
  return (
    <div className="bg-ground text-ink">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-6xl">Work</h1>
        {hasWork ? (
          <>
            <WorkCompares />
            <WorkStack />
          </>
        ) : null}
        <ContactActions className="mt-10 items-stretch sm:items-center" />
      </div>
    </div>
  )
}
