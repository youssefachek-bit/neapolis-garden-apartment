import {
  AirVent,
  Ban,
  BedDouble,
  Car,
  Clock,
  Coffee,
  CookingPot,
  Flower2,
  PartyPopper,
  PawPrint,
  ShieldCheck,
  Sun,
  Tv,
  Users,
  WashingMachine,
  Waves,
  Wifi,
  Cigarette,
} from 'lucide-react'
import { SITE } from '@/lib/site'
import { PRICING } from '@/lib/pricing'
import { cdn } from '@/lib/images'

const AMENITIES = [
  {
    icon: Wifi,
    title: 'Fast Wi-Fi',
    text: 'Fibre connection, ready for remote work',
  },
  {
    icon: AirVent,
    title: 'Air conditioning',
    text: 'In the living room and both bedrooms',
  },
  {
    icon: Flower2,
    title: 'Private garden',
    text: 'Olive & lemon trees, jasmine pergola',
  },
  {
    icon: CookingPot,
    title: 'Full kitchen',
    text: 'Oven, fridge, cookware & coffee maker',
  },
  {
    icon: BedDouble,
    title: 'Fresh linens',
    text: 'Bed linen and towels provided',
  },
  {
    icon: WashingMachine,
    title: 'Washing machine',
    text: 'With drying rack in the garden',
  },
  { icon: Car, title: 'Free parking', text: 'Secure parking on the premises' },
  { icon: Tv, title: 'Smart TV', text: 'Streaming apps for slow evenings' },
  {
    icon: Waves,
    title: 'Near the beach',
    text: 'Nabeul’s sandy coast close by',
  },
  {
    icon: Coffee,
    title: 'Welcome basket',
    text: 'Tunisian coffee, tea & local treats',
  },
]

const RULES = [
  {
    icon: Clock,
    title: 'Check-in & check-out',
    text: `Check-in from ${SITE.checkInTime}, check-out by ${SITE.checkOutTime}. Flexible times on request.`,
  },
  {
    icon: Users,
    title: 'Guests',
    text: `Maximum ${PRICING.maxGuests} guests. Only registered guests may stay overnight.`,
  },
  {
    icon: Cigarette,
    title: 'No smoking indoors',
    text: 'Smoking is welcome in the garden only.',
  },
  {
    icon: PartyPopper,
    title: 'No parties or events',
    text: 'Quiet hours from 22:00 to 08:00 — we love our neighbours.',
  },
  {
    icon: PawPrint,
    title: 'Pets on request',
    text: 'Well-behaved pets may be accepted — ask us first.',
  },
  {
    icon: ShieldCheck,
    title: 'ID on arrival',
    text: 'A valid ID or passport is required for each adult guest, as required by Tunisian law.',
  },
  {
    icon: Sun,
    title: 'Save energy',
    text: 'Please switch off the air conditioning when you go out.',
  },
  {
    icon: Ban,
    title: 'Respect the home',
    text: 'Treat the house like your own; damages are charged at cost.',
  },
]

export function Amenities() {
  return (
    <section id="amenities" className="py-20 sm:py-28">
      <div className="mx-auto grid max-w-content gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-accent">
            Amenities
          </p>
          <h2 className="font-display text-4xl font-medium sm:text-5xl">
            Everything for an easy stay
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Thoughtfully equipped for families, couples and long-stay travellers
            who want to live like a local in Cap Bon.
          </p>
          <img
            src={cdn('/img/terrace-1.jpg', 800)}
            alt="Breakfast under the jasmine pergola"
            loading="lazy"
            className="arch mt-10 hidden aspect-[3/4] w-full max-w-sm object-cover lg:block"
          />
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {AMENITIES.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="flex gap-4 rounded-[var(--radius)] border bg-card p-5"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-medium">{title}</h3>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function HouseRules() {
  return (
    <section
      id="rules"
      className="bg-deep py-20 text-primary-foreground sm:py-28"
    >
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[oklch(0.8_0.11_55)]">
            House rules
          </p>
          <h2 className="font-display text-4xl font-medium sm:text-5xl">
            A few gentle house rules
          </h2>
          <p className="mt-4 text-primary-foreground/70">
            So every guest — and our neighbours — enjoy the calm of the garden.
          </p>
        </div>
        <ul className="grid gap-px overflow-hidden rounded-[calc(var(--radius)*1.4)] bg-primary-foreground/15 sm:grid-cols-2 lg:grid-cols-4">
          {RULES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="bg-deep p-6">
              <Icon
                className="mb-4 size-6 text-[oklch(0.8_0.11_55)]"
                aria-hidden
              />
              <h3 className="font-display text-xl">{title}</h3>
              <p className="mt-2 text-sm text-primary-foreground/70">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
