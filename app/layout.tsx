import type { Metadata } from "next"
import { Outfit } from "next/font/google"

import { marks, site } from "@/lib/site"

import "./globals.css"

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-outfit",
})

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: {
    default: site.seoTitle,
    template: `%s | ${site.name}`,
  },
  description: site.seoDescription,
  applicationName: site.name,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: site.seoTitle,
    description: site.seoDescription,
    url: site.siteUrl,
    siteName: site.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: marks.logo,
        alt: "M & M Professional Cleaning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.seoTitle,
    description: site.seoDescription,
    images: [marks.logo],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full`}>
      <body className="min-h-full bg-ground">{children}</body>
    </html>
  )
}
