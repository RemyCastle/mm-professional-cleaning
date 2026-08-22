"use client"

import { CompareSlider } from "@/components/compare-slider"
import { useLive } from "@/components/live-public"
import { pairIsPublic } from "@/lib/pairs"

export function WorkCompares() {
  const { pairs } = useLive()
  const shown = pairs.filter(pairIsPublic)
  if (shown.length === 0) return null
  return (
    <div className="mt-8 flex max-w-xl flex-col gap-6">
      <h2 className="text-4xl">Before and After</h2>
      {shown.map((pair) => (
        <CompareSlider key={pair.id} pair={pair} />
      ))}
    </div>
  )
}
