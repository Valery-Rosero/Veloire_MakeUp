// Sliding window rate limiter — respaldado en Postgres (tabla rate_limit_hits),
// para que el límite se comparta entre todas las instancias serverless en vez
// de vivir en memoria de una sola.
import { createAdminClient } from '@/lib/supabase/server'

export async function isRateLimited(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const supabase = await createAdminClient()
  const windowStart = new Date(Date.now() - windowMs).toISOString()

  const { count } = await supabase
    .from('rate_limit_hits')
    .select('*', { count: 'exact', head: true })
    .eq('key', key)
    .gte('created_at', windowStart)

  if ((count ?? 0) >= limit) return true

  await supabase.from('rate_limit_hits').insert({ key })
  return false
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  )
}
