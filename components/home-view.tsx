"use client"

import Image from "next/image"

import { AboutLines } from "@/components/about-lines"
import { ContactActions } from "@/components/contact-actions"
import { useLive } from "@/components/live-public"
import { ServiceLines } from "@/components/service-lines"
import { WorkCompares } from "@/components/work-compares"
import { WorkStack } from "@/components/work-stack"
import { photoIsPublic } from "@/lib/public"
import { pairIsPublic } from "@/lib/pairs"
import { marks } from "@/lib/site"

export function HomeView() {
  const { site, photos, pairs } = useLive()
  const hasWork = photos.some(photoIsPublic) || pairs.some(pairIsPublic)
  return (
    <div className="bg-ground text-white">
      <section>
        <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-10 text-center sm:py-14">
          <Image
            src={marks.logo}
            alt="M & M Professional Cleaning"
            width={720}
            height={720}
            className="h-auto w-full max-w-md object-contain"
            unoptimized
            priority
          />
          <h1 className="mt-8 max-w-xl text-4xl sm:text-5xl md:text-[3.2rem]">
            {site.hero_title}
          </h1>
          <p className="mt-5 max-w-md text-lg font-medium sm:text-xl">{site.hero_lead}</p>
          <ContactActions className="mt-8" />
        </div>
      </section>

      <section className="border-t border-white/25">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-5xl">Work</h2>
          <ServiceLines />
        </div>
      </section>

      {hasWork ? (
        <section id="photos" className="border-t border-white/25">
          <div className="mx-auto max-w-5xl px-4 py-12">
            <WorkCompares />
            <WorkStack />
          </div>
        </section>
      ) : null}

      <section className="border-t border-white/25">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-5xl">About</h2>
          <AboutLines text={site.about} />
        </div>
      </section>
    </div>
  )
}
