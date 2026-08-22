"use client"

import { useLive } from "@/components/live-public"
import { photoIsPublic } from "@/lib/public"

export function WorkStack() {
  const { photos } = useLive()
  const shown = photos.filter(photoIsPublic)
  return (
    <div className="mt-8 flex max-w-xl flex-col gap-6">
      {shown.map((photo, index) => (
        <figure key={photo.src + String(photo.id ?? index)} className="vinyl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.src}
            alt={photo.alt || photo.caption}
            width={photo.width}
            height={photo.height}
            className="h-auto w-full"
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
          {photo.caption.trim() ? (
            <figcaption className="work-cap border-t-4 border-ink px-3 py-2 font-display text-2xl">
              {photo.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  )
}
