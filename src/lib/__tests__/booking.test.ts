import { describe, expect, it } from 'vitest'
import { PRICING, calculateQuote, overlapsBlocked } from '@/lib/pricing'
import { buildIcal, parseIcal } from '@/lib/ical'

describe('calculateQuote', () => {
  it('prices weekday and weekend nights plus cleaning', () => {
    // Mon 2027-03-01 → Mon 2027-03-08: 7 nights, Fri+Sat weekend
    const q = calculateQuote('2027-03-01', '2027-03-08', 2)!
    expect(q.nights).toBe(7)
    expect(q.weekendNights).toBe(2)
    const nights = 5 * PRICING.nightlyRate + 2 * PRICING.weekendRate
    const discount = Math.round((nights * 10) / 100)
    expect(q.discountPercent).toBe(10)
    expect(q.total).toBe(nights + PRICING.cleaningFee - discount)
  })

  it('applies the monthly discount and extra guest fees', () => {
    const q = calculateQuote(
      '2027-03-01',
      '2027-03-31',
      PRICING.baseGuests + 1,
    )!
    expect(q.discountPercent).toBe(20)
    expect(q.extraGuestTotal).toBe(PRICING.extraGuestFee * 30)
  })

  it('rejects invalid ranges', () => {
    expect(calculateQuote('2027-03-05', '2027-03-05', 2)).toBeNull()
  })
})

describe('availability', () => {
  const blocked = [{ start: '2027-03-10', end: '2027-03-12' }]
  it('allows check-out on the day a booking starts', () => {
    expect(overlapsBlocked('2027-03-07', '2027-03-10', blocked)).toBe(false)
    expect(overlapsBlocked('2027-03-12', '2027-03-14', blocked)).toBe(false)
    expect(overlapsBlocked('2027-03-09', '2027-03-11', blocked)).toBe(true)
  })
})

describe('iCal', () => {
  it('parses Airbnb-style feeds', () => {
    const feed = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'DTEND;VALUE=DATE:20270315',
      'DTSTART;VALUE=DATE:20270310',
      'UID:1418fb94e984-abc@airbnb.com',
      'SUMMARY:Reserved',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'DTSTART:20270401T140000Z',
      'DTEND:20270403T100000Z',
      'UID:booking-1',
      'SUMMARY:CLOSED - Not avail',
      ' able',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')
    expect(parseIcal(feed)).toEqual([
      {
        uid: '1418fb94e984-abc@airbnb.com',
        start: '2027-03-10',
        end: '2027-03-15',
        summary: 'Reserved',
      },
      {
        uid: 'booking-1',
        start: '2027-04-01',
        end: '2027-04-03',
        summary: 'CLOSED - Not available',
      },
    ])
  })

  it('round-trips exported feeds', () => {
    const events = [
      {
        uid: 'x@ng',
        start: '2027-05-01',
        end: '2027-05-04',
        summary: 'Blocked',
      },
    ]
    expect(parseIcal(buildIcal(events, 'Test'))).toEqual(events)
  })
})
