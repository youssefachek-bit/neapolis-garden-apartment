import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { GALLERY, cdn, cdnSrcSet, type GalleryCategory } from '@/lib/images'
import { cn } from '@/lib/utils'

const FILTERS: ('All' | GalleryCategory)[] = [
  'All',
  'Living room',
  'Bedroom',
  'Terrace',
  'Kitchen',
]

export function Gallery() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All')
  const [active, setActive] = useState<number | null>(null)
  const items =
    filter === 'All' ? GALLERY : GALLERY.filter((g) => g.category === filter)
  const current = active !== null ? items[active] : null

  const step = (dir: number) =>
    setActive((i) => (i === null ? i : (i + dir + items.length) % items.length))

  return (
    <section id="gallery" className="py-20 sm:py-28">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-accent">
              Gallery
            </p>
            <h2 className="font-display text-4xl font-medium sm:text-5xl">
              Inside Neapolis Garden
            </h2>
            <p className="mt-4 text-muted-foreground">
              Lime-washed walls, hand-painted Nabeul ceramics and a garden that
              becomes your second living room.
            </p>
          </div>
          <div
            role="group"
            aria-label="Filter photos by room"
            className="flex flex-wrap gap-2"
          >
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm transition-colors motion-reduce:transition-none',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  filter === f
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card hover:border-primary/40',
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <ul className="grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[240px]">
          {items.map((img, i) => (
            <li
              key={img.src}
              className={cn(
                'group relative overflow-hidden rounded-[calc(var(--radius)*1.4)] bg-muted',
                filter === 'All' &&
                  (i === 0 || i === 5) &&
                  'sm:col-span-2 sm:row-span-2',
              )}
            >
              <button
                type="button"
                onClick={() => setActive(i)}
                className="block h-full w-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-label={`Open photo: ${img.alt}`}
              >
                <img
                  src={cdn(img.src, 900)}
                  srcSet={cdnSrcSet(img.src, [500, 900, 1300])}
                  sizes="(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
                  alt={img.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-background/85 px-3 py-1 text-xs backdrop-blur">
                  {img.category}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Dialog
        open={current !== null}
        onOpenChange={(o) => !o && setActive(null)}
      >
        <DialogContent className="max-w-5xl gap-3 border-none bg-deep p-3 text-primary-foreground sm:max-w-5xl">
          {current && (
            <>
              <DialogTitle className="sr-only">{current.category}</DialogTitle>
              <DialogDescription className="sr-only">
                {current.alt}
              </DialogDescription>
              <img
                src={cdn(current.src, 1600, 82)}
                alt={current.alt}
                className="max-h-[75vh] w-full rounded-lg object-contain"
              />
              <div className="flex items-center justify-between gap-3 px-1">
                <p className="text-sm text-primary-foreground/80">
                  <span className="font-medium text-primary-foreground">
                    {current.category}
                  </span>{' '}
                  — {current.alt}
                </p>
                {items.length > 1 && (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Previous photo"
                      onClick={() => step(-1)}
                      className="hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    >
                      <ChevronLeft />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Next photo"
                      onClick={() => step(1)}
                      className="hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    >
                      <ChevronRight />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
