export const site = {
  name: "M & M Professional Cleaning",
  legalName: "M & M Professional Cleaning",
  town: "Eugene / Springfield and surrounding",
  townShort: "Eugene / Springfield",
  towns: "Eugene / Springfield and surrounding",
  serviceArea: "Eugene / Springfield and surrounding",
  phoneDisplay: "(541) 310-0590",
  phoneTel: "tel:+15413100590",
  phoneSms: "sms:+15413100590",
  email: "m.mprofessionalcleaning@yahoo.com",
  emailMailto: "mailto:m.mprofessionalcleaning@yahoo.com",
  formSubmit: "https://formsubmit.co/m.mprofessionalcleaning@yahoo.com",
  siteUrl: "https://mm-professional-cleaning.pages.dev",
  seoTitle: "M & M Professional Cleaning | Eugene and Springfield, OR",
  seoDescription:
    "Houses, move-in, move-out, after the build, deep clean. Free estimates. Call (541) 310-0590.",
  telephoneE164: "+1-541-310-0590",
  heroTitle: "Eugene and Springfield. We clean them.",
  heroLead: "Houses, move-in, move-out, after the build, deep clean. Free estimates.",
  ctaPrimary: "Call (541) 310-0590",
  ctaSecondary: "Text (541) 310-0590",
  ctaEmail: "Email us",
  about:
    "M & M Professional Cleaning.\nMore than ten years.\nEugene, Springfield, and surrounding.\nEstimates are free.\nCall, text, or email.",
  quoteHeading: "Free estimate",
  quoteSubmit: "Send",
  quotePhotos: "Photo of the job, optional",
  quoteHelper: "Or call (541) 310-0590.",
} as const

export const marks = {
  logo: "/logo.jpeg",
  logoMark: "/logo.jpeg",
} as const

export const jobPhotos: readonly {
  src: string
  alt: string
  caption: string
  width: number
  height: number
}[] = [
  {
    src: "/work/residential-cleaning.jpg",
    alt: "Residential Cleaning",
    caption: "Residential Cleaning",
    width: 1600,
    height: 1067,
  },
  {
    src: "/work/move-in-move-out.jpg",
    alt: "Move In / Move Out",
    caption: "Move In / Move Out",
    width: 1600,
    height: 1067,
  },
  {
    src: "/work/post-construction.jpg",
    alt: "Post-Construction",
    caption: "Post-Construction",
    width: 1600,
    height: 1067,
  },
  {
    src: "/work/deep-cleaning.jpg",
    alt: "Deep Cleaning",
    caption: "Deep Cleaning",
    width: 1600,
    height: 2400,
  },
]

export const services = [
  {
    slug: "residential-cleaning",
    name: "Residential Cleaning",
    blurb: "Regular house clean.",
  },
  {
    slug: "move-in-move-out",
    name: "Move In / Move Out",
    blurb: "Empty house, in or out.",
  },
  {
    slug: "post-construction",
    name: "Post-Construction",
    blurb: "After the build. The dust goes.",
  },
  {
    slug: "deep-cleaning",
    name: "Deep Cleaning",
    blurb: "The rooms that need more than a wipe.",
  },
] as const
