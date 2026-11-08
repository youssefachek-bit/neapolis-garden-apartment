import type { Config } from '@netlify/functions'
import { syncAllCalendars } from '../../src/server/calendar'

export default async () => {
  const results = await syncAllCalendars()
  console.log('Calendar sync', JSON.stringify(results))
}

export const config: Config = {
  schedule: '*/30 * * * *',
}
