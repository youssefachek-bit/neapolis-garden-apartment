import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Copy, Loader2, LogOut, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  addBlock,
  getAdminOverview,
  removeBlock,
  syncNow,
} from '@/lib/calendar.functions'

export const Route = createFileRoute('/admin')({
  head: () => ({
    meta: [
      { title: 'Calendar admin · Neapolis Garden' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: AdminPage,
})

type Overview = Awaited<ReturnType<typeof getAdminOverview>>
const KEY = 'ng-admin-pw'
const SOURCE_LABEL: Record<string, string> = {
  airbnb: 'Airbnb',
  booking: 'Booking.com',
  direct: 'Direct',
}

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : 'Something went wrong'
}

function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [data, setData] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [origin, setOrigin] = useState('')

  async function load(pw: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await getAdminOverview({ data: { password: pw } })
      setData(res)
      setAuthed(true)
      sessionStorage.setItem(KEY, pw)
    } catch (e) {
      setError(errMsg(e))
      setAuthed(false)
      sessionStorage.removeItem(KEY)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // window/sessionStorage only exist in the browser, so read them after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin)
    const saved = sessionStorage.getItem(KEY)
    if (saved) {
      setPassword(saved)
      void load(saved)
    }
  }, [])

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-secondary/50 px-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="font-display text-2xl">
              Calendar admin
            </CardTitle>
            <CardDescription>Owner access for Neapolis Garden.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                void load(password)
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="pw">Password</Label>
                <Input
                  id="pw"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !password}
              >
                {loading && <Loader2 className="animate-spin" />} Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-secondary/40">
      <div className="mx-auto max-w-content space-y-6 px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-4xl">Calendar sync</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={loading}
              onClick={async () => {
                setLoading(true)
                try {
                  const results = await syncNow({ data: { password } })
                  const failed = results.filter((r) => !r.ok)
                  if (!results.length)
                    toast.info('No external calendars configured yet')
                  else if (failed.length)
                    toast.error(
                      `Sync failed for ${failed.map((f) => SOURCE_LABEL[f.source]).join(', ')}`,
                    )
                  else toast.success('Calendars synced')
                } catch (e) {
                  toast.error(errMsg(e))
                }
                await load(password)
              }}
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} /> Sync now
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                sessionStorage.removeItem(KEY)
                setAuthed(false)
                setPassword('')
                setData(null)
              }}
            >
              <LogOut /> Sign out
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Imported calendars</CardTitle>
              <CardDescription>
                Bookings are pulled from these iCal links every 30 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data?.sources.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start justify-between gap-3 rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{s.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {!s.configured
                        ? `Not connected — set ${s.id === 'airbnb' ? 'AIRBNB_ICAL_URL' : 'BOOKING_ICAL_URL'} in the site's environment variables`
                        : s.lastSyncedAt
                          ? `Last synced ${new Date(s.lastSyncedAt).toLocaleString()} · ${s.eventCount} booking(s)`
                          : 'Waiting for first sync'}
                    </p>
                  </div>
                  <Badge
                    variant={
                      !s.configured
                        ? 'secondary'
                        : s.lastStatus === 'ok'
                          ? 'default'
                          : 'destructive'
                    }
                  >
                    {!s.configured
                      ? 'Off'
                      : s.lastStatus === 'ok'
                        ? 'OK'
                        : s.lastStatus
                          ? 'Error'
                          : 'Pending'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export links</CardTitle>
              <CardDescription>
                Paste these into each platform's “Import calendar” setting so
                they block dates booked elsewhere.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'For Airbnb', path: '/api/calendar.ics?for=airbnb' },
                {
                  label: 'For Booking.com',
                  path: '/api/calendar.ics?for=booking',
                },
                {
                  label: 'All bookings (Google Calendar etc.)',
                  path: '/api/calendar.ics',
                },
              ].map((l) => (
                <div key={l.path} className="space-y-1">
                  <p className="text-sm font-medium">{l.label}</p>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={origin + l.path}
                      className="font-mono text-xs"
                      aria-label={l.label}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label={`Copy link ${l.label}`}
                      onClick={() => {
                        void navigator.clipboard.writeText(origin + l.path)
                        toast.success('Link copied')
                      }}
                    >
                      <Copy />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <AddBlockCard password={password} onAdded={() => load(password)} />

        <Card>
          <CardHeader>
            <CardTitle>Upcoming bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {!data ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : data.events.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No upcoming bookings.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.events.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {SOURCE_LABEL[e.source] ?? e.source}
                          </Badge>
                        </TableCell>
                        <TableCell>{e.start}</TableCell>
                        <TableCell>{e.end}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {e.summary}
                        </TableCell>
                        <TableCell>
                          {e.source === 'direct' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label={`Remove booking ${e.start} to ${e.end}`}
                              onClick={async () => {
                                try {
                                  await removeBlock({
                                    data: { password, id: e.id },
                                  })
                                  toast.success('Booking removed')
                                  await load(password)
                                } catch (err) {
                                  toast.error(errMsg(err))
                                }
                              }}
                            >
                              <Trash2 />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function AddBlockCard({
  password,
  onAdded,
}: {
  password: string
  onAdded: () => Promise<void>
}) {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a direct booking</CardTitle>
        <CardDescription>
          Block dates booked via WhatsApp or phone. They're shared with Airbnb
          and Booking.com through the export links.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 sm:grid-cols-[1fr_1fr_2fr_auto] sm:items-end"
          onSubmit={async (e) => {
            e.preventDefault()
            if (end <= start) {
              toast.error('Check-out must be after check-in')
              return
            }
            setSaving(true)
            try {
              await addBlock({ data: { password, start, end, note } })
              toast.success('Dates blocked')
              setStart('')
              setEnd('')
              setNote('')
              await onAdded()
            } catch (err) {
              toast.error(errMsg(err))
            } finally {
              setSaving(false)
            }
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="b-start">Check-in</Label>
            <Input
              id="b-start"
              type="date"
              required
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="b-end">Check-out</Label>
            <Input
              id="b-end"
              type="date"
              required
              value={end}
              min={start || undefined}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="b-note">Note (private)</Label>
            <Input
              id="b-note"
              maxLength={200}
              value={note}
              placeholder="Guest name, phone…"
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />} Block dates
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
