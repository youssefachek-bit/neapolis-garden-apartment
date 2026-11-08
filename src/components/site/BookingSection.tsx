import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Minus,
  MessageCircle,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AvailabilityCalendar } from '@/components/site/AvailabilityCalendar'
import { getAvailability } from '@/lib/calendar.functions'
import {
  PRICING,
  addDays,
  calculateQuote,
  formatTND,
  overlapsBlocked,
  parseISODate,
  type BlockedRange,
} from '@/lib/pricing'
import { whatsappLink } from '@/lib/site'

function localToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function prettyDate(iso: string) {
  return parseISODate(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function BookingSection() {
  const [today, setToday] = useState<string | null>(null)
  const [blocked, setBlocked] = useState<BlockedRange[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)
  const [name, setName] = useState('')

  async function load() {
    setStatus('loading')
    try {
      const res = await getAvailability()
      setBlocked(res.blocked)
      setStatus(res.error ? 'error' : 'ready')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    // Browser-only values must be read after hydration (server has no local date).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(localToday())
    void load()
  }, [])

  const nightsOk = checkIn && checkOut && checkOut > checkIn
  const quote = useMemo(
    () => (nightsOk ? calculateQuote(checkIn, checkOut, guests) : null),
    [checkIn, checkOut, guests, nightsOk],
  )
  const conflict = Boolean(
    nightsOk && overlapsBlocked(checkIn, checkOut, blocked),
  )
  const tooShort = Boolean(quote && quote.nights < PRICING.minNights)
  const canBook = Boolean(quote && !conflict && !tooShort)

  const nextDiscount = quote
    ? [...PRICING.discounts]
        .sort((a, b) => a.minNights - b.minNights)
        .find((d) => quote.nights < d.minNights)
    : null

  const message = quote
    ? [
        `Hello! I'd like to book Neapolis Garden${name.trim() ? ` — my name is ${name.trim()}` : ''}.`,
        `Check-in: ${prettyDate(checkIn)}`,
        `Check-out: ${prettyDate(checkOut)} (${quote.nights} night${quote.nights > 1 ? 's' : ''})`,
        `Guests: ${guests}`,
        `Estimated total: ${formatTND(quote.total)}`,
        'Is it available?',
      ].join('\n')
    : 'Hello! I would like to book Neapolis Garden.'

  return (
    <section id="booking" className="relative bg-secondary/60 py-20 sm:py-28">
      <div
        className="tile-pattern pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
      />
      <div className="relative mx-auto max-w-content px-4 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-accent">
            Availability & rates
          </p>
          <h2 className="font-display text-4xl font-medium sm:text-5xl">
            Plan your stay
          </h2>
          <p className="mt-4 text-muted-foreground">
            The calendar stays in sync with our Airbnb and Booking.com listings.
            Pick your dates to see an instant price in Tunisian Dinar, then
            confirm with us on WhatsApp — no platform fees.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          <div className="rounded-[calc(var(--radius)*1.6)] border bg-card p-5 shadow-sm sm:p-7">
            {status === 'error' && (
              <Alert className="mb-5">
                <AlertCircle />
                <AlertDescription className="flex flex-wrap items-center gap-3">
                  Live availability couldn't be loaded. You can still get a
                  quote — we'll confirm dates on WhatsApp.
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void load()}
                  >
                    <RefreshCw /> Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <AvailabilityCalendar
              today={status === 'loading' ? null : today}
              blocked={blocked}
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={(a, b) => {
                setCheckIn(a)
                setCheckOut(b)
              }}
            />
          </div>

          <aside
            aria-label="Booking fee calculator"
            className="flex flex-col rounded-[calc(var(--radius)*1.6)] bg-deep p-6 text-primary-foreground shadow-xl sm:p-8"
          >
            <p className="font-display text-3xl">
              {formatTND(PRICING.nightlyRate)}
              <span className="font-sans text-sm text-primary-foreground/70">
                {' '}
                / night
              </span>
            </p>
            <p className="mt-1 text-xs text-primary-foreground/60">
              {formatTND(PRICING.weekendRate)} on Friday & Saturday nights ·
              min. {PRICING.minNights} nights
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="check-in"
                  className="text-xs text-primary-foreground/70"
                >
                  Check-in
                </Label>
                <Input
                  id="check-in"
                  type="date"
                  value={checkIn}
                  min={today ?? undefined}
                  onChange={(e) => {
                    const v = e.target.value
                    setCheckIn(v)
                    if (checkOut && v && checkOut <= v)
                      setCheckOut(addDays(v, PRICING.minNights))
                  }}
                  className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground [color-scheme:dark]"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="check-out"
                  className="text-xs text-primary-foreground/70"
                >
                  Check-out
                </Label>
                <Input
                  id="check-out"
                  type="date"
                  value={checkOut}
                  min={checkIn ? addDays(checkIn, 1) : (today ?? undefined)}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-md border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-2">
              <div>
                <p id="guests-label" className="text-sm">
                  Guests
                </p>
                <p className="text-xs text-primary-foreground/60">
                  {PRICING.baseGuests} included · +
                  {formatTND(PRICING.extraGuestFee)}/night each extra
                </p>
              </div>
              <div
                className="flex items-center gap-3"
                role="group"
                aria-labelledby="guests-label"
              >
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Remove a guest"
                  disabled={guests <= 1}
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  className="size-8 rounded-full border border-primary-foreground/30 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                >
                  <Minus />
                </Button>
                <span
                  className="w-5 text-center text-lg tabular-nums"
                  aria-live="polite"
                >
                  {guests}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label="Add a guest"
                  disabled={guests >= PRICING.maxGuests}
                  onClick={() =>
                    setGuests((g) => Math.min(PRICING.maxGuests, g + 1))
                  }
                  className="size-8 rounded-full border border-primary-foreground/30 hover:bg-primary-foreground/15 hover:text-primary-foreground"
                >
                  <Plus />
                </Button>
              </div>
            </div>

            <div className="mt-6 flex-1" aria-live="polite">
              {!quote ? (
                <p className="rounded-md border border-dashed border-primary-foreground/25 p-5 text-center text-sm text-primary-foreground/70">
                  Choose check-in and check-out dates to see your price
                  breakdown.
                </p>
              ) : (
                <dl className="space-y-3 text-sm">
                  {quote.weekdayNights > 0 && (
                    <Row
                      label={`${formatTND(PRICING.nightlyRate)} × ${quote.weekdayNights} night${quote.weekdayNights > 1 ? 's' : ''}`}
                      value={formatTND(
                        quote.weekdayNights * PRICING.nightlyRate,
                      )}
                    />
                  )}
                  {quote.weekendNights > 0 && (
                    <Row
                      label={`${formatTND(PRICING.weekendRate)} × ${quote.weekendNights} weekend night${quote.weekendNights > 1 ? 's' : ''}`}
                      value={formatTND(
                        quote.weekendNights * PRICING.weekendRate,
                      )}
                    />
                  )}
                  {quote.extraGuests > 0 && (
                    <Row
                      label={`Extra guests (${quote.extraGuests} × ${quote.nights} nights)`}
                      value={formatTND(quote.extraGuestTotal)}
                    />
                  )}
                  <Row
                    label="Cleaning fee"
                    value={formatTND(quote.cleaningFee)}
                  />
                  {quote.discountAmount > 0 && (
                    <Row
                      label={`${quote.discountLabel} discount (−${quote.discountPercent}%)`}
                      value={`− ${formatTND(quote.discountAmount)}`}
                      highlight
                    />
                  )}
                  <Separator className="bg-primary-foreground/20" />
                  <div className="flex items-end justify-between">
                    <dt className="font-medium">
                      Total ({quote.nights} nights)
                    </dt>
                    <dd className="font-display text-3xl">
                      {formatTND(quote.total)}
                    </dd>
                  </div>
                  <p className="text-right text-xs text-primary-foreground/60">
                    ≈ {formatTND(quote.averageNightly)} per night, all fees
                    included
                  </p>
                  {nextDiscount && !conflict && (
                    <p className="rounded-md bg-primary-foreground/10 px-3 py-2 text-xs text-primary-foreground/85">
                      Stay {nextDiscount.minNights - quote.nights} more night
                      {nextDiscount.minNights - quote.nights > 1 ? 's' : ''} to
                      save {nextDiscount.percent}% with the{' '}
                      {nextDiscount.label.toLowerCase()} discount.
                    </p>
                  )}
                </dl>
              )}
              {conflict && (
                <p
                  role="alert"
                  className="mt-4 rounded-md bg-destructive/90 px-3 py-2 text-sm text-destructive-foreground"
                >
                  Some of these nights are already booked. Please choose
                  different dates.
                </p>
              )}
              {tooShort && !conflict && (
                <p
                  role="alert"
                  className="mt-4 rounded-md bg-accent/90 px-3 py-2 text-sm text-accent-foreground"
                >
                  The minimum stay is {PRICING.minNights} nights.
                </p>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="guest-name"
                  className="text-xs text-primary-foreground/70"
                >
                  Your name (optional)
                </Label>
                <Input
                  id="guest-name"
                  value={name}
                  maxLength={60}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah"
                  className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40"
                />
              </div>
              <Button
                asChild={canBook}
                disabled={!canBook}
                size="lg"
                className="h-12 w-full rounded-full bg-[#25D366] text-base text-[#06331a] hover:bg-[#25D366]/90"
              >
                {canBook ? (
                  <a
                    href={whatsappLink(message)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle /> Request booking on WhatsApp
                  </a>
                ) : (
                  <>
                    <MessageCircle /> Request booking on WhatsApp
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-primary-foreground/60">
                Nothing is charged now — we confirm your dates personally.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt
        className={
          highlight
            ? 'text-[oklch(0.86_0.12_150)]'
            : 'text-primary-foreground/80'
        }
      >
        {label}
      </dt>
      <dd
        className={
          highlight
            ? 'text-[oklch(0.86_0.12_150)] tabular-nums'
            : 'tabular-nums'
        }
      >
        {value}
      </dd>
    </div>
  )
}
