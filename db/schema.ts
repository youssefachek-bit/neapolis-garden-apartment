import {
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

/**
 * Booked / blocked stays. Imported from Airbnb and Booking.com iCal feeds,
 * or added manually by the owner ("direct" bookings, e.g. via WhatsApp).
 * end_date is exclusive (the check-out day), matching iCal semantics.
 */
export const calendarEvents = pgTable(
  'calendar_events',
  {
    id: serial().primaryKey(),
    source: text().notNull(),
    uid: text().notNull(),
    startDate: date('start_date', { mode: 'string' }).notNull(),
    endDate: date('end_date', { mode: 'string' }).notNull(),
    summary: text().notNull().default(''),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => [uniqueIndex('calendar_events_source_uid_idx').on(t.source, t.uid)],
)

/** Last sync status for each external calendar feed. */
export const calendarSources = pgTable('calendar_sources', {
  source: text().primaryKey(),
  lastSyncedAt: timestamp('last_synced_at').notNull(),
  lastStatus: text('last_status').notNull(),
  eventCount: integer('event_count').notNull().default(0),
})
