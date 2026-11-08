export const SITE = {
  name: 'Neapolis Garden',
  city: 'Nabeul, Tunisia',
  whatsappNumber: '21623444602',
  whatsappDisplay: '+216 23 444 602',
  mapsQuery: 'Nabeul, Tunisia',
  checkInTime: '15:00',
  checkOutTime: '11:00',
}

export function whatsappLink(message: string) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`
}
