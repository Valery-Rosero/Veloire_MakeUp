'use server'

import { createClient } from '@/lib/supabase/server'

export interface CompareProduct {
  id: string
  slug: string
  name: string
  price: number
  comparison: Record<string, string> | null
  categories: { name: string; slug: string } | null
  product_images: Array<{ url: string; alt_text: string | null; is_main: boolean }>
}

export async function getProductsForCompare(ids: string[]): Promise<CompareProduct[]> {
  if (ids.length === 0) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('id, slug, name, price, comparison, categories(name, slug), product_images(url, alt_text, is_main)')
    .in('id', ids)
    .eq('status', 'active')
  return (data as CompareProduct[] | null) ?? []
}
