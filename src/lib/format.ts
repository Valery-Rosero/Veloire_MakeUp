export function formatPrice(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))
}

export function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (seconds < 60) return 'hace un momento'
  if (minutes < 60) return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`
  if (hours < 24) return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`
  if (days === 1) return 'ayer'
  if (days < 7) return `hace ${days} días`
  return formatDate(iso)
}

export function calculateDiscountPct(
  price: number,
  comparePrice: number | null | undefined
): number | null {
  if (!comparePrice || comparePrice <= price) return null
  return Math.round((1 - price / comparePrice) * 100)
}

export { slugify } from '@/lib/slug'
