import { useEffect, useState } from 'react'
import { Menu, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { whatsappLink } from '@/lib/site'

const NAV = [
  { href: '#booking', label: 'Book' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#amenities', label: 'Amenities' },
  { href: '#rules', label: 'House rules' },
  { href: '#contact', label: 'Location' },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-colors duration-300 motion-reduce:transition-none',
        scrolled
          ? 'border-b border-border/70 bg-background/90 text-foreground backdrop-blur'
          : 'bg-transparent text-primary-foreground',
      )}
    >
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold">
            Neapolis Garden
          </span>
          <span className="hidden text-xs uppercase tracking-[0.2em] opacity-80 sm:inline">
            Nabeul
          </span>
        </a>
        <nav
          aria-label="Main"
          className="hidden items-center gap-7 text-sm md:flex"
        >
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="opacity-85 transition-opacity hover:opacity-100"
            >
              {n.label}
            </a>
          ))}
          <Button
            asChild
            size="sm"
            className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <a
              href={whatsappLink(
                'Hello! I would like to book Neapolis Garden.',
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle /> WhatsApp
            </a>
          </Button>
        </nav>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle className="font-display text-2xl">
                Neapolis Garden
              </SheetTitle>
              <SheetDescription>
                Garden apartment in Nabeul, Tunisia
              </SheetDescription>
            </SheetHeader>
            <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-3 text-lg hover:bg-muted"
                >
                  {n.label}
                </a>
              ))}
              <Button
                asChild
                className="mt-4 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <a
                  href={whatsappLink(
                    'Hello! I would like to book Neapolis Garden.',
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle /> Book on WhatsApp
                </a>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
