import { LivePublicProvider } from "@/components/live-public"
import { LocalBusinessJsonLd } from "@/components/local-business-json-ld"
import { QuoteBlock } from "@/components/quote-block"
import { ReviewsBlock } from "@/components/reviews-block"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { ThumbDock } from "@/components/thumb-dock"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LivePublicProvider>
      <div className="flex min-h-full flex-col pb-40 md:pb-8">
        <LocalBusinessJsonLd />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <ReviewsBlock />
        <QuoteBlock />
        <SiteFooter />
        <ThumbDock />
      </div>
    </LivePublicProvider>
  )
}
