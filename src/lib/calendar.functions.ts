import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const password = z.string().min(1).max(200)

export const getAvailability = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { getBlockedRanges } = await import('../server/calendar')
    try {
      return { blocked: await getBlockedRanges(), error: null as string | null }
    } catch (err) {
      console.error('Availability lookup failed', err)
      return {
        blocked: [],
        error: 'Live availability is temporarily unavailable.',
      }
    }
  },
)

async function requireAdmin(pw: string) {
  const { isAdminPassword } = await import('../server/admin-auth')
  if (!process.env.ADMIN_PASSWORD)
    throw new Error('Admin access is not configured.')
  if (!isAdminPassword(pw)) throw new Error('Incorrect password.')
}

export const getAdminOverview = createServerFn({ method: 'POST' })
  .validator(z.object({ password }))
  .handler(async ({ data }) => {
    await requireAdmin(data.password)
    const { getUpcomingEvents, getSourceStatus } =
      await import('../server/calendar')
    const [events, sources] = await Promise.all([
      getUpcomingEvents(),
      getSourceStatus(),
    ])
    return {
      sources,
      events: events.map((e) => ({
        id: e.id,
        source: e.source,
        start: e.startDate,
        end: e.endDate,
        summary: e.summary,
      })),
    }
  })

export const syncNow = createServerFn({ method: 'POST' })
  .validator(z.object({ password }))
  .handler(async ({ data }) => {
    await requireAdmin(data.password)
    const { syncAllCalendars } = await import('../server/calendar')
    return syncAllCalendars()
  })

export const addBlock = createServerFn({ method: 'POST' })
  .validator(
    z
      .object({
        password,
        start: isoDate,
        end: isoDate,
        note: z.string().max(200),
      })
      .refine((v) => v.end > v.start, {
        message: 'Check-out must be after check-in',
      }),
  )
  .handler(async ({ data }) => {
    await requireAdmin(data.password)
    const { addDirectBlock } = await import('../server/calendar')
    const row = await addDirectBlock(data.start, data.end, data.note.trim())
    return { id: row.id }
  })

export const removeBlock = createServerFn({ method: 'POST' })
  .validator(z.object({ password, id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    await requireAdmin(data.password)
    const { removeDirectBlock } = await import('../server/calendar')
    await removeDirectBlock(data.id)
    return { ok: true }
  })
