export type IcalEvent = {
  uid: string
  start: string // YYYY-MM-DD
  end: string // YYYY-MM-DD, exclusive
  summary: string
}

function unfold(text: string): string[] {
  return text
    .replace(/\r\n[ \t]/g, '')
    .replace(/\n[ \t]/g, '')
    .split(/\r?\n/)
}

function toDate(value: string): string | null {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})/)
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null
}

function unescape(value: string) {
  return value
    .replace(/\\n/gi, ' ')
    .replace(/\\([,;\\])/g, '$1')
    .trim()
}

/** Minimal iCal (RFC 5545) VEVENT parser suited to Airbnb / Booking.com exports. */
export function parseIcal(text: string): IcalEvent[] {
  const events: IcalEvent[] = []
  let current: Partial<IcalEvent> | null = null
  for (const line of unfold(text)) {
    if (line === 'BEGIN:VEVENT') {
      current = {}
      continue
    }
    if (line === 'END:VEVENT') {
      if (current?.start) {
        const end =
          current.end && current.end > current.start
            ? current.end
            : nextDay(current.start)
        events.push({
          uid: current.uid || `${current.start}-${end}`,
          start: current.start,
          end,
          summary: current.summary ?? '',
        })
      }
      current = null
      continue
    }
    if (!current) continue
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).split(';')[0].toUpperCase()
    const value = line.slice(idx + 1)
    if (key === 'UID') current.uid = value.trim()
    else if (key === 'SUMMARY') current.summary = unescape(value)
    else if (key === 'DTSTART') current.start = toDate(value) ?? undefined
    else if (key === 'DTEND') current.end = toDate(value) ?? undefined
  }
  return events
}

function nextDay(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

function escape(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/([,;])/g, '\\$1')
    .replace(/\n/g, '\\n')
}

export function buildIcal(events: IcalEvent[], calendarName: string): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d+/, '')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Neapolis Garden//Availability//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escape(calendarName)}`,
  ]
  for (const e of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${escape(e.uid)}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${e.start.replace(/-/g, '')}`,
      `DTEND;VALUE=DATE:${e.end.replace(/-/g, '')}`,
      `SUMMARY:${escape(e.summary || 'Not available')}`,
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n') + '\r\n'
}
