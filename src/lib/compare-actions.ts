'use server'

import { createPublicClient } from '@/lib/supabase/server'

export interface CompareProduct {
  id: string
  slug: string
  name: string
  price: number
  comparison: Record<string, string> | null
  categories: { name: string; slug: string } | null
  product_images: Array<{ url: string; alt_text: string | null; is_main: boolean }>
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Server Action = endpoint público: se filtran los ids y se limita la cantidad
// para que nadie pueda pedir el catálogo entero por acá.
export async function getProductsForCompare(ids: string[]): Promise<CompareProduct[]> {
  const validIds = ids.filter((id) => typeof id === 'string' && UUID.test(id)).slice(0, 4) // = MAX_COMPARE (no se importa el store de zustand en el servidor)
  if (validIds.length === 0) return []
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('products')
    .select('id, slug, name, price, comparison, categories(name, slug), product_images(url, alt_text, is_main)')
    .in('id', validIds)
    .eq('status', 'active')
  return (data as CompareProduct[] | null) ?? []
}
