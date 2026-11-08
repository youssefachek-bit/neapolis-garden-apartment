import { and, eq, gte, inArray, notInArray } from 'drizzle-orm'
import { db } from '../../db'
import { calendarEvents, calendarSources } from '../../db/schema'
import { parseIcal, type IcalEvent } from '../lib/ical'

export const EXTERNAL_SOURCES = [
  { id: 'airbnb', label: 'Airbnb', envVar: 'AIRBNB_ICAL_URL' },
  { id: 'booking', label: 'Booking.com', envVar: 'BOOKING_ICAL_URL' },
] as const

export type SourceId = (typeof EXTERNAL_SOURCES)[number]['id'] | 'direct'

const STALE_AFTER_MS = 30 * 60 * 1000

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function configuredSources() {
  return EXTERNAL_SOURCES.flatMap((s) => {
    const url = process.env[s.envVar]?.trim()
    return url && /^https?:\/\//i.test(url) ? [{ ...s, url }] : []
  })
}

async function syncSource(source: { id: string; url: string }) {
  let events: IcalEvent[]
  try {
    const res = await fetch(source.url, {
      signal: AbortSignal.timeout(10_000),
      headers: { 'User-Agent': 'NeapolisGarden-CalendarSync/1.0' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    if (!text.includes('BEGIN:VCALENDAR')) throw new Error('Not an iCal feed')
    events = parseIcal(text).filter((e) => e.end >= todayISO())
  } catch (err) {
    const status = `error: ${err instanceof Error ? err.message : 'sync failed'}`
    await db
      .insert(calendarSources)
      .values({
        source: source.id,
        lastSyncedAt: new Date(),
        lastStatus: status,
      })
      .onConflictDoUpdate({
        target: calendarSources.source,
        set: { lastSyncedAt: new Date(), lastStatus: status },
      })
    return { source: source.id, ok: false, count: 0 }
  }

  // De-duplicate UIDs within the feed
  const unique = [...new Map(events.map((e) => [e.uid, e])).values()]

  await db.transaction(async (tx) => {
    await tx.delete(calendarEvents).where(eq(calendarEvents.source, source.id))
    if (unique.length) {
      await tx.insert(calendarEvents).values(
        unique.map((e) => ({
          source: source.id,
          uid: e.uid,
          startDate: e.start,
          endDate: e.end,
          summary: e.summary.slice(0, 200),
        })),
      )
    }
    await tx
      .insert(calendarSources)
      .values({
        source: source.id,
        lastSyncedAt: new Date(),
        lastStatus: 'ok',
        eventCount: unique.length,
      })
      .onConflictDoUpdate({
        target: calendarSources.source,
        set: {
          lastSyncedAt: new Date(),
          lastStatus: 'ok',
          eventCount: unique.length,
        },
      })
  })
  return { source: source.id, ok: true, count: unique.length }
}

/** Pull every configured iCal feed into the database. */
export async function syncAllCalendars() {
  const sources = configuredSources()
  // Remove events from sources that are no longer configured
  const keep = ['direct', ...sources.map((s) => s.id)]
  await db.delete(calendarEvents).where(notInArray(calendarEvents.source, keep))
  return Promise.all(sources.map(syncSource))
}

/** Sync feeds that haven't been refreshed recently (best effort). */
export async function syncIfStale() {
  const sources = configuredSources()
  if (!sources.length) return
  const rows = await db
    .select()
    .from(calendarSources)
    .where(
      inArray(
        calendarSources.source,
        sources.map((s) => s.id),
      ),
    )
  const now = Date.now()
  const stale = sources.filter((s) => {
    const row = rows.find((r) => r.source === s.id)
    return !row || now - row.lastSyncedAt.getTime() > STALE_AFTER_MS
  })
  if (stale.length) await Promise.all(stale.map(syncSource))
}

export async function getUpcomingEvents(excludeSource?: string) {
  const rows = await db
    .select()
    .from(calendarEvents)
    .where(gte(calendarEvents.endDate, todayISO()))
    .orderBy(calendarEvents.startDate)
  return excludeSource ? rows.filter((r) => r.source !== excludeSource) : rows
}

/** Merged blocked ranges, without revealing guest details. */
export async function getBlockedRanges() {
  try {
    await syncIfStale()
  } catch (err) {
    console.error('Calendar sync failed', err)
  }
  const rows = await getUpcomingEvents()
  const merged: { start: string; end: string }[] = []
  for (const r of rows) {
    const last = merged[merged.length - 1]
    if (last && r.startDate <= last.end) {
      if (r.endDate > last.end) last.end = r.endDate
    } else merged.push({ start: r.startDate, end: r.endDate })
  }
  return merged
}

export async function getSourceStatus() {
  const rows = await db.select().from(calendarSources)
  return EXTERNAL_SOURCES.map((s) => {
    const row = rows.find((r) => r.source === s.id)
    return {
      id: s.id,
      label: s.label,
      configured: Boolean(process.env[s.envVar]?.trim()),
      lastSyncedAt: row?.lastSyncedAt.toISOString() ?? null,
      lastStatus: row?.lastStatus ?? null,
      eventCount: row?.eventCount ?? 0,
    }
  })
}

export async function addDirectBlock(start: string, end: string, note: string) {
  const [row] = await db
    .insert(calendarEvents)
    .values({
      source: 'direct',
      uid: `direct-${crypto.randomUUID()}@neapolis-garden`,
      startDate: start,
      endDate: end,
      summary: note || 'Direct booking',
    })
    .returning()
  return row
}

export async function removeDirectBlock(id: number) {
  await db
    .delete(calendarEvents)
    .where(and(eq(calendarEvents.id, id), eq(calendarEvents.source, 'direct')))
}
