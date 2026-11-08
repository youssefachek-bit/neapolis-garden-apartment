import {
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plane,
  ShoppingBag,
  Umbrella,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SITE, whatsappLink } from '@/lib/site'

const NEARBY = [
  { icon: Umbrella, text: 'Nabeul beaches & seafront promenade' },
  { icon: ShoppingBag, text: 'Friday market & pottery souks of the medina' },
  { icon: MapPin, text: 'Neapolis archaeological site & Hammamet nearby' },
  { icon: Plane, text: 'Tunis-Carthage & Enfidha airports by car' },
]

export function Contact() {
  return (
    <section id="contact" className="py-20 sm:py-28">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-accent">
            Location & contact
          </p>
          <h2 className="font-display text-4xl font-medium sm:text-5xl">
            Find us in Nabeul
          </h2>
          <p className="mt-4 text-muted-foreground">
            Named after the ancient Roman city of Neapolis, our garden apartment
            sits in the heart of Cap Bon — the capital of Tunisian ceramics,
            citrus orchards and long sandy beaches.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="overflow-hidden rounded-[calc(var(--radius)*1.6)] border bg-muted">
            <iframe
              title="Map of Neapolis Garden in Nabeul, Tunisia"
              src={`https://www.google.com/maps?q=${encodeURIComponent(SITE.mapsQuery)}&z=14&output=embed`}
              className="h-[360px] w-full lg:h-full lg:min-h-[440px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="flex flex-col gap-6 rounded-[calc(var(--radius)*1.6)] border bg-card p-6 sm:p-8">
            <div>
              <h3 className="font-display text-2xl">
                Book directly with the host
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Message us on WhatsApp for availability, long-stay offers or
                airport transfers. We speak Arabic, French and English.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="h-13 rounded-full bg-[#25D366] text-base text-[#06331a] hover:bg-[#25D366]/90"
            >
              <a
                href={whatsappLink(
                  'Hello! I would like to book Neapolis Garden. Are you available on …?',
                )}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle /> Book on WhatsApp
              </a>
            </Button>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="size-4 text-primary" aria-hidden />
                <a
                  href={`tel:+${SITE.whatsappNumber}`}
                  className="hover:underline"
                >
                  {SITE.whatsappDisplay}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="size-4 text-primary" aria-hidden />
                {SITE.city}
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-4 text-primary" aria-hidden />
                Exact address shared after booking
              </li>
            </ul>
            <div className="border-t pt-5">
              <h4 className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Around you
              </h4>
              <ul className="space-y-2.5 text-sm">
                {NEARBY.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3">
                    <Icon className="size-4 text-olive" aria-hidden /> {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="border-t bg-secondary/50">
      <div className="mx-auto flex max-w-content flex-col gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-display text-lg text-foreground">
            Neapolis Garden
          </span>{' '}
          · Garden apartment in {SITE.city}
        </p>
        <p>
          Also listed on Airbnb & Booking.com · © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}

export function FloatingWhatsApp() {
  return (
    <a
      href={whatsappLink('Hello! I have a question about Neapolis Garden.')}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-5 bottom-5 z-30 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-[#06331a] shadow-lg transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:transition-none"
    >
      <MessageCircle className="size-6" />
    </a>
  )
}
