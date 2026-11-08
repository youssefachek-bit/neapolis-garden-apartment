import { createFileRoute } from '@tanstack/react-router'
import { buildIcal } from '@/lib/ical'
import { getUpcomingEvents, syncIfStale } from '@/server/calendar'

const PLATFORMS = new Set(['airbnb', 'booking'])

/**
 * Export feed to paste into Airbnb / Booking.com "Import calendar".
 * ?for=airbnb omits events imported from Airbnb (so they don't loop back).
 */
export const Route = createFileRoute('/api/calendar.ics')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const target = new URL(request.url).searchParams.get('for') ?? ''
        const exclude = PLATFORMS.has(target) ? target : undefined
        try {
          await syncIfStale()
        } catch (err) {
          console.error('Calendar sync failed', err)
        }
        try {
          const events = await getUpcomingEvents(exclude)
          const body = buildIcal(
            events.map((e) => ({
              uid: e.source === 'direct' ? e.uid : `${e.source}-${e.uid}`,
              start: e.startDate,
              end: e.endDate,
              summary: 'Neapolis Garden - Not available',
            })),
            'Neapolis Garden',
          )
          return new Response(body, {
            headers: {
              'Content-Type': 'text/calendar; charset=utf-8',
              'Cache-Control': 'public, max-age=300',
            },
          })
        } catch (err) {
          console.error('Calendar export failed', err)
          return new Response('Calendar temporarily unavailable', {
            status: 503,
          })
        }
      },
    },
  },
})
