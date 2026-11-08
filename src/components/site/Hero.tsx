import { CalendarDays, MapPin } from 'lucide-react'
import { SITE } from '@/lib/site'
import { Button } from '@/components/ui/button'
import { cdn, cdnSrcSet } from '@/lib/images'
import { PRICING, formatTND } from '@/lib/pricing'

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] items-end overflow-hidden"
    >
      <img
        src={cdn('/img/hero.jpg', 1600, 80)}
        srcSet={cdnSrcSet('/img/hero.jpg', [800, 1200, 1600, 2000])}
        sizes="100vw"
        alt="Garden terrace of Neapolis Garden with bougainvillea, olive and lemon trees overlooking the sea"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-deep/90 via-deep/35 to-deep/30" />
      <div className="mx-auto w-full max-w-content px-4 pt-32 pb-16 text-primary-foreground sm:px-6 md:pb-24">
        <div className="max-w-2xl animate-rise">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1.5 text-xs uppercase tracking-[0.22em] backdrop-blur">
            <MapPin className="size-3.5" /> Nabeul · Cap Bon · Tunisia
          </p>
          <h1 className="font-display text-5xl leading-[0.95] font-medium sm:text-7xl md:text-8xl">
            Neapolis{' '}
            <em className="font-medium text-[oklch(0.86_0.09_60)]">Garden</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg font-light text-primary-foreground/90 sm:text-xl">
            A whitewashed garden apartment among olive and lemon trees, minutes
            from the golden beaches and pottery souks of Nabeul.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-accent px-7 text-base text-accent-foreground hover:bg-accent/90"
            >
              <a href="#booking">
                <CalendarDays /> Check availability
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-primary-foreground/50 bg-transparent px-7 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <a href="#gallery">View the apartment</a>
            </Button>
          </div>
        </div>
        <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-6 border-t border-primary-foreground/20 pt-6 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-primary-foreground/70">From</dt>
            <dd className="font-display text-2xl">
              {formatTND(PRICING.nightlyRate)}
              <span className="text-sm font-sans text-primary-foreground/70">
                {' '}
                /night
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-primary-foreground/70">Guests</dt>
            <dd className="font-display text-2xl">Up to {PRICING.maxGuests}</dd>
          </div>
          <div>
            <dt className="text-primary-foreground/70">Bedrooms</dt>
            <dd className="font-display text-2xl">2 + garden</dd>
          </div>
          <div>
            <dt className="text-primary-foreground/70">Check-in</dt>
            <dd className="font-display text-2xl">From {SITE.checkInTime}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
