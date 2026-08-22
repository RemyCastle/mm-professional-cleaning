export const site = {
  name: "M & M Professional Cleaning",
  legalName: "M & M Professional Cleaning",
  town: "Eugene and Springfield, Oregon",
  townShort: "Eugene / Springfield, OR",
  towns: "Eugene/Springfield and surrounding areas",
  serviceArea: "Eugene/Springfield and surrounding areas",
  phoneDisplay: "(541) 310-0590",
  phoneTel: "tel:+15413100590",
  email: "m.mprofessionalcleaning@yahoo.com",
  emailMailto: "mailto:m.mprofessionalcleaning@yahoo.com",
  formSubmit: "https://formsubmit.co/m.mprofessionalcleaning@yahoo.com",
  siteUrl: "https://mm-professional-cleaning.pages.dev",
  seoTitle: "M & M Professional Cleaning | Eugene and Springfield, OR",
  seoDescription:
    "Residential, move-in, deep clean. Ten years at it. Free estimates. Call (541) 310-0590.",
  telephoneE164: "+1-541-310-0590",
  heroTitle: "Residential, move-in, deep clean. Call for a free estimate.",
  heroLead: "Eugene and Springfield. Ten years at it.",
  ctaPrimary: "Call (541) 310-0590",
  ctaSecondary: "Email us",
  about:
    "We clean homes in Eugene and Springfield.\nTen years at it.\nEstimates are free.\nCall, text, or email.",
  quoteHeading: "Free estimate",
  quoteSubmit: "Send",
  quotePhotos: "Photo of the job, optional",
  quoteHelper: "Or call (541) 310-0590.",
  moreLine: "And more.",
} as const

export const marks = {
  logo: "/logo.jpeg",
  logoMark: "/logo-mark.png",
} as const

export const jobPhotos: readonly {
  src: string
  alt: string
  caption: string
  width: number
  height: number
}[] = []

export const services = [
  { slug: "residential-cleaning", name: "Residential Cleaning" },
  { slug: "move-in-move-out", name: "Move In / Move Out" },
  { slug: "post-construction", name: "Post-Construction" },
  { slug: "deep-cleaning", name: "Deep Cleaning" },
] as const
