/**
 * Booking prices in Tunisian Dinar (TND).
 * Edit the values below to change what the calculator shows.
 */
export const PRICING = {
  nightlyRate: 180,
  /** Weekend nights (Friday & Saturday) rate. Set equal to nightlyRate to disable. */
  weekendRate: 200,
  cleaningFee: 60,
  /** Included guests; each extra guest adds extraGuestFee per night. */
  baseGuests: 4,
  extraGuestFee: 25,
  maxGuests: 6,
  minNights: 2,
  /** Long-stay discounts, highest threshold that matches wins. */
  discounts: [
    { minNights: 7, percent: 10, label: 'Weekly stay' },
    { minNights: 28, percent: 20, label: 'Monthly stay' },
  ],
} as const

export type Quote = {
  nights: number
  weekendNights: number
  weekdayNights: number
  nightsSubtotal: number
  extraGuests: number
  extraGuestTotal: number
  cleaningFee: number
  discountPercent: number
  discountLabel: string | null
  discountAmount: number
  total: number
  averageNightly: number
}

const DAY = 86_400_000

export function parseISODate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function addDays(iso: string, days: number): string {
  return toISODate(new Date(parseISODate(iso).getTime() + days * DAY))
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round(
    (parseISODate(checkOut).getTime() - parseISODate(checkIn).getTime()) / DAY,
  )
}

export function calculateQuote(
  checkIn: string,
  checkOut: string,
  guests: number,
): Quote | null {
  const nights = nightsBetween(checkIn, checkOut)
  if (!Number.isFinite(nights) || nights <= 0) return null

  let weekendNights = 0
  for (let i = 0; i < nights; i++) {
    const day = parseISODate(addDays(checkIn, i)).getUTCDay()
    if (day === 5 || day === 6) weekendNights++
  }
  const weekdayNights = nights - weekendNights
  const nightsSubtotal =
    weekdayNights * PRICING.nightlyRate + weekendNights * PRICING.weekendRate

  const extraGuests = Math.max(0, guests - PRICING.baseGuests)
  const extraGuestTotal = extraGuests * PRICING.extraGuestFee * nights

  const discount = [...PRICING.discounts]
    .sort((a, b) => b.minNights - a.minNights)
    .find((d) => nights >= d.minNights)
  const discountPercent = discount?.percent ?? 0
  const discountAmount = Math.round(
    ((nightsSubtotal + extraGuestTotal) * discountPercent) / 100,
  )

  const total =
    nightsSubtotal + extraGuestTotal + PRICING.cleaningFee - discountAmount

  return {
    nights,
    weekendNights,
    weekdayNights,
    nightsSubtotal,
    extraGuests,
    extraGuestTotal,
    cleaningFee: PRICING.cleaningFee,
    discountPercent,
    discountLabel: discount?.label ?? null,
    discountAmount,
    total,
    averageNightly: Math.round(total / nights),
  }
}

export function formatTND(amount: number): string {
  return `${new Intl.NumberFormat('en-US').format(amount)} TND`
}

export type BlockedRange = { start: string; end: string }

/** True if any night in [checkIn, checkOut) overlaps a blocked range. */
export function overlapsBlocked(
  checkIn: string,
  checkOut: string,
  blocked: BlockedRange[],
): boolean {
  return blocked.some((b) => checkIn < b.end && checkOut > b.start)
}

export function isNightBlocked(iso: string, blocked: BlockedRange[]): boolean {
  return blocked.some((b) => iso >= b.start && iso < b.end)
}
