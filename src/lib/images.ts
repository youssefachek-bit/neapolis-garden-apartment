/** Serve local images through Netlify Image CDN, resized and in modern formats. */
export function cdn(src: string, width: number, quality = 75) {
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`
}

export function cdnSrcSet(src: string, widths: number[]) {
  return widths.map((w) => `${cdn(src, w)} ${w}w`).join(', ')
}

export type GalleryCategory = 'Living room' | 'Bedroom' | 'Terrace' | 'Kitchen'

export const GALLERY: {
  src: string
  category: GalleryCategory
  alt: string
}[] = [
  {
    src: '/img/living-1.jpg',
    category: 'Living room',
    alt: 'Bright living room with linen sofa, Berber rug and arched window',
  },
  {
    src: '/img/terrace-1.jpg',
    category: 'Terrace',
    alt: 'Jasmine-covered pergola with breakfast table and citrus trees',
  },
  {
    src: '/img/bedroom-1.jpg',
    category: 'Bedroom',
    alt: 'Master bedroom with white linen and blue shutters open to the garden',
  },
  {
    src: '/img/kitchen-1.jpg',
    category: 'Kitchen',
    alt: 'Kitchen with blue zellige tiles, marble counter and wooden shelves',
  },
  {
    src: '/img/living-2.jpg',
    category: 'Living room',
    alt: 'Reading corner with plaster shelves and Nabeul pottery',
  },
  {
    src: '/img/terrace-2.jpg',
    category: 'Terrace',
    alt: 'Sunset lounge on the terrace with cushions, lanterns and bougainvillea',
  },
  {
    src: '/img/bedroom-2.jpg',
    category: 'Bedroom',
    alt: 'Second bedroom with twin beds and striped Tunisian blankets',
  },
  {
    src: '/img/kitchen-2.jpg',
    category: 'Kitchen',
    alt: 'Dining nook with round wooden table and hand-painted ceramics',
  },
]
