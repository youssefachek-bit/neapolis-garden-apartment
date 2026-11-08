import { createFileRoute } from '@tanstack/react-router'
import { SiteHeader } from '@/components/site/SiteHeader'
import { Hero } from '@/components/site/Hero'
import { BookingSection } from '@/components/site/BookingSection'
import { Gallery } from '@/components/site/Gallery'
import { Amenities, HouseRules } from '@/components/site/Amenities'
import { Contact, FloatingWhatsApp, Footer } from '@/components/site/Contact'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Intro />
        <BookingSection />
        <Gallery />
        <Amenities />
        <HouseRules />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  )
}

function Intro() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto grid max-w-content items-center gap-12 px-4 sm:px-6 md:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-accent">
            Welcome
          </p>
          <h2 className="font-display text-4xl leading-tight font-medium sm:text-5xl">
            Slow Mediterranean days, the Tunisian way
          </h2>
        </div>
        <div className="space-y-4 text-muted-foreground">
          <p>
            Wake up to birdsong under the jasmine, take your coffee among the
            lemon trees and spend the afternoon on Nabeul’s golden beaches.
            Neapolis Garden blends traditional Tunisian craftsmanship — blue
            shutters, zellige tiles, hand-thrown pottery — with the comfort of a
            modern home.
          </p>
          <p>
            Two calm bedrooms, a bright living room, a fully equipped kitchen
            and a private garden terrace make it ideal for families, friends and
            long stays.
          </p>
        </div>
      </div>
    </section>
  )
}
