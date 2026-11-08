import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  isNightBlocked,
  overlapsBlocked,
  parseISODate,
  type BlockedRange,
} from '@/lib/pricing'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

type Props = {
  today: string | null
  blocked: BlockedRange[]
  checkIn: string
  checkOut: string
  onChange: (checkIn: string, checkOut: string) => void
}

function monthStart(iso: string, offset: number) {
  const d = parseISODate(iso)
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + offset, 1))
}

function monthDays(first: Date) {
  const y = first.getUTCFullYear()
  const m = first.getUTCMonth()
  const count = new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
  const lead = (first.getUTCDay() + 6) % 7 // Monday first
  const days: (string | null)[] = Array.from({ length: lead }, () => null)
  for (let i = 1; i <= count; i++) {
    days.push(new Date(Date.UTC(y, m, i)).toISOString().slice(0, 10))
  }
  return days
}

export function AvailabilityCalendar({
  today,
  blocked,
  checkIn,
  checkOut,
  onChange,
}: Props) {
  const [offset, setOffset] = useState(0)
  const [hover, setHover] = useState<string | null>(null)

  const months = useMemo(
    () => (today ? [0, 1].map((i) => monthStart(today, offset + i)) : []),
    [today, offset],
  )

  if (!today) {
    return (
      <div
        className="grid gap-6 md:grid-cols-2"
        aria-busy="true"
        aria-label="Loading calendar"
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            className={cn('space-y-3', i === 1 && 'hidden md:block')}
          >
            <Skeleton className="mx-auto h-6 w-32" />
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, j) => (
                <Skeleton key={j} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const selectingOut = Boolean(checkIn && !checkOut)

  function handleClick(day: string) {
    if (!checkIn || checkOut || day <= checkIn) {
      if (!isNightBlocked(day, blocked)) onChange(day, '')
      return
    }
    if (!overlapsBlocked(checkIn, day, blocked)) onChange(checkIn, day)
    else if (!isNightBlocked(day, blocked)) onChange(day, '')
  }

  const previewEnd = selectingOut && hover && hover > checkIn ? hover : checkOut

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Previous month"
          disabled={offset === 0}
          onClick={() => setOffset((o) => Math.max(0, o - 1))}
        >
          <ChevronLeft />
        </Button>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {selectingOut
            ? 'Select your check-out date'
            : 'Select your check-in date'}
        </p>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Next month"
          disabled={offset >= 16}
          onClick={() => setOffset((o) => o + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {months.map((first, idx) => (
          <div
            key={first.toISOString()}
            className={cn(idx === 1 && 'hidden md:block')}
          >
            <h4 className="mb-3 text-center font-display text-xl font-semibold">
              {first.toLocaleDateString('en-GB', {
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
              })}
            </h4>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
              {WEEKDAYS.map((w) => (
                <div key={w} className="py-1 font-medium">
                  {w}
                </div>
              ))}
            </div>
            <div
              className="grid grid-cols-7 gap-1"
              onMouseLeave={() => setHover(null)}
            >
              {monthDays(first).map((day, i) => {
                if (!day) return <div key={`e${i}`} />
                const past = day < today
                const nightBlocked = isNightBlocked(day, blocked)
                const validCheckout =
                  selectingOut &&
                  day > checkIn &&
                  !overlapsBlocked(checkIn, day, blocked)
                const disabled = past || (nightBlocked && !validCheckout)
                const isStart = day === checkIn
                const isEnd = day === checkOut
                const inRange = Boolean(
                  checkIn && previewEnd && day > checkIn && day < previewEnd,
                )
                const label = `${parseISODate(day).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  timeZone: 'UTC',
                })}${nightBlocked ? ', booked' : ''}${isStart ? ', check-in' : ''}${isEnd ? ', check-out' : ''}`
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={disabled}
                    aria-label={label}
                    aria-pressed={isStart || isEnd}
                    onClick={() => handleClick(day)}
                    onMouseEnter={() => setHover(day)}
                    className={cn(
                      'relative aspect-square rounded-lg text-sm transition-colors motion-reduce:transition-none',
                      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                      !disabled && 'hover:bg-secondary',
                      past && 'text-muted-foreground/40',
                      nightBlocked &&
                        !past &&
                        'bg-muted text-muted-foreground/60 line-through decoration-accent/70',
                      inRange && 'rounded-none bg-primary/10 text-foreground',
                      (isStart || isEnd) &&
                        'bg-primary text-primary-foreground no-underline hover:bg-primary',
                      validCheckout && nightBlocked && 'no-underline',
                    )}
                  >
                    {Number(day.slice(8))}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded bg-primary" /> Your stay
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded bg-muted ring-1 ring-border" /> Booked
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded ring-1 ring-border" /> Available
        </span>
        {checkIn && (
          <button
            type="button"
            className="ml-auto underline underline-offset-4 hover:text-foreground"
            onClick={() => onChange('', '')}
          >
            Clear dates
          </button>
        )}
      </div>
    </div>
  )
}
