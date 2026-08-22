"use client"

import { useLive } from "@/components/live-public"

function Stars({ n }: { n: number }) {
  return (
    <p className="text-sm font-semibold" aria-label={`${n} stars`}>
      {"★".repeat(n)}
      {"☆".repeat(5 - n)}
    </p>
  )
}

export function ReviewsBlock() {
  const { reviews } = useLive()
  if (reviews.length === 0) return null
  return (
    <section className="border-t border-ink/25 bg-ground text-ink">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-5xl">Reviews</h2>
        <ul className="mt-8 flex max-w-xl flex-col gap-8">
          {reviews.map((review) => (
            <li key={review.id}>
              <blockquote className="work-cap pl-4">
                <Stars n={review.stars} />
                <p className="mt-2 text-xl font-medium">{review.text}</p>
                <footer className="mt-3 font-semibold">{review.name}</footer>
              </blockquote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
