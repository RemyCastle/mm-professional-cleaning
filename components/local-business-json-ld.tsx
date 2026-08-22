import { services, site } from "@/lib/site"

export function LocalBusinessJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.name,
    description: site.seoDescription,
    telephone: site.telephoneE164,
    email: site.email,
    url: site.siteUrl,
    areaServed: [
      { "@type": "City", name: "Eugene" },
      { "@type": "City", name: "Springfield" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Cleaning services",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
        },
      })),
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
