"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { pairIsComplete, type LivePair } from "@/lib/pairs"

export function CompareSlider({ pair }: { pair: LivePair }) {
  const box = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const [pos, setPos] = useState(50)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => setWidth(el.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const move = useCallback((clientX: number) => {
    const el = box.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0) return
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)))
  }, [])

  if (!pairIsComplete(pair)) return null

  const caption = pair.caption.trim()
  const beforeAlt = caption ? `${caption}, before` : "Before"
  const afterAlt = caption ? `${caption}, after` : "After"

  return (
    <figure className="vinyl overflow-hidden">
      <div
        ref={box}
        className="compare"
        onPointerDown={(event) => {
          dragging.current = true
          event.currentTarget.setPointerCapture(event.pointerId)
          move(event.clientX)
        }}
        onPointerMove={(event) => {
          if (dragging.current) move(event.clientX)
        }}
        onPointerUp={() => {
          dragging.current = false
        }}
        onPointerCancel={() => {
          dragging.current = false
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pair.after_src} alt={afterAlt} className="compare-base" draggable={false} />
        <div className="compare-before" style={{ width: `${pos}%` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pair.before_src}
            alt={beforeAlt}
            draggable={false}
            style={{ width: width ? `${width}px` : "100%" }}
          />
        </div>
        <div className="compare-bar" style={{ left: `${pos}%` }} aria-hidden="true">
          <span className="compare-knob">‹ ›</span>
        </div>
        <span className="compare-tag compare-tag-before">Before</span>
        <span className="compare-tag compare-tag-after">After</span>
      </div>
      <label className="compare-control">
        <span className="sr-only">Compare before and after</span>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(event) => setPos(Number(event.target.value))}
          aria-label="Compare before and after"
        />
      </label>
      {caption ? (
        <figcaption className="work-cap border-t-4 border-ink px-3 py-2 font-display text-2xl">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
