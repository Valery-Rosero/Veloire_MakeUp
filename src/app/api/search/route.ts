import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const supabase = await createClient()

    const { data } = await supabase
      .from('products')
      .select(`
        id, name, slug, price, compare_price, brand,
        categories ( name ),
        product_images ( url, alt_text, is_main )
      `)
      .eq('status', 'active')
      .or(`name.ilike.%${q}%,brand.ilike.%${q}%,description.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .limit(10)

    const results = (data ?? []).map((p) => {
      const images = p.product_images as unknown as Array<{ url: string; alt_text: string | null; is_main: boolean }> | null
      const mainImg = images?.find((img) => img.is_main) ?? images?.[0] ?? null
      const category = p.categories as unknown as { name: string } | null

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        compare_price: p.compare_price,
        brand: p.brand,
        category_name: category?.name ?? null,
        image_url: mainImg?.url ?? null,
        image_alt: mainImg?.alt_text ?? p.name,
      }
    })

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
