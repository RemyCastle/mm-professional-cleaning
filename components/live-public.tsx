"use client"

import { createContext, useContext, useEffect, useState } from "react"

import { fallbackPairs, pairIsPublic, type LivePair } from "@/lib/pairs"
import {
  fallbackPhotos,
  fallbackServices,
  fallbackSite,
  photoIsPublic,
  serviceBlurb,
  type LivePhoto,
  type LiveService,
  type LiveSite,
} from "@/lib/public"

type Live = {
  site: LiveSite
  services: LiveService[]
  photos: LivePhoto[]
  pairs: LivePair[]
}

const LiveContext = createContext<Live>({
  site: fallbackSite,
  services: fallbackServices,
  photos: fallbackPhotos,
  pairs: fallbackPairs,
})

export function useLive() {
  return useContext(LiveContext)
}

export function LivePublicProvider({ children }: { children: React.ReactNode }) {
  const [live, setLive] = useState<Live>({
    site: fallbackSite,
    services: fallbackServices,
    photos: fallbackPhotos,
    pairs: fallbackPairs,
  })

  useEffect(() => {
    let gone = false
    Promise.all([
      fetch("/api/public/site").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/public/photos").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/public/pairs").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([siteRes, photoRes, pairRes]) => {
        if (gone) return
        setLive({
          site: siteRes?.site
            ? {
                hero_title: siteRes.site.hero_title,
                hero_lead: siteRes.site.hero_lead,
                about: siteRes.site.about,
                phone_display: siteRes.site.phone_display,
                email: siteRes.site.email,
                towns: siteRes.site.towns,
                cta_primary: siteRes.site.cta_primary,
                cta_secondary: siteRes.site.cta_secondary,
                quote_heading: siteRes.site.quote_heading,
                quote_submit: siteRes.site.quote_submit,
                quote_photos: siteRes.site.quote_photos,
                quote_helper: siteRes.site.quote_helper,
              }
            : fallbackSite,
          services: Array.isArray(siteRes?.services) && siteRes.services.length
            ? siteRes.services.map((row: LiveService) => ({
                ...row,
                blurb: serviceBlurb(row),
              }))
            : fallbackServices,
          photos: Array.isArray(photoRes?.photos)
            ? photoRes.photos.filter(photoIsPublic)
            : fallbackPhotos,
          pairs: Array.isArray(pairRes?.pairs) ? pairRes.pairs.filter(pairIsPublic) : fallbackPairs,
        })
      })
      .catch(() => {
        // keep fallback so the public site never goes blank
      })
    return () => {
      gone = true
    }
  }, [])

  return <LiveContext.Provider value={live}>{children}</LiveContext.Provider>
}
