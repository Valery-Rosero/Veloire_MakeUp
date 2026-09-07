import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CatalogoFilters } from '@/components/store/CatalogoFilters'
import { ProductGrid } from '@/components/store/ProductGrid'
import { CatalogoPagination } from '@/components/store/CatalogoPagination'
import type { Category, CatalogoProduct } from '@/types/catalog'

// ─── Constantes ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 20

interface PageProps {
  searchParams: Promise<{ categoria?: string; orden?: string; pagina?: string; q?: string }>
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, description')
      .eq('is_active', true)
      .order('sort_order')
    return data ?? []
  } catch {
    return []
  }
}

async function getProducts(
  categoria?: string,
  orden?: string,
  page = 1,
  q?: string,
): Promise<{ products: CatalogoProduct[]; total: number }> {
  try {
    const supabase = await createClient()

    let categoryId: string | null = null
    if (categoria) {
      const { data: catRows } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categoria)
        .limit(1)
      categoryId = (catRows as Array<{ id: string }> | null)?.[0]?.id ?? null
    }

    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
      .from('products')
      .select(
        `id, slug, name, price, compare_price,
        product_images(url, alt_text, is_main),
        product_shades(id, is_active, stock),
        categories(name, slug)`,
        { count: 'exact' },
      )
      .eq('status', 'active')
      .range(from, to)

    if (categoryId) query = query.eq('category_id', categoryId)

    if (q?.trim()) {
      query = query.or(`name.ilike.%${q.trim()}%,brand.ilike.%${q.trim()}%,description.ilike.%${q.trim()}%`)
    }

    switch (orden) {
      case 'precio-asc':  query = query.order('price', { ascending: true });  break
      case 'precio-desc': query = query.order('price', { ascending: false }); break
      case 'nombre-az':   query = query.order('name',  { ascending: true });  break
      default:            query = query.order('created_at', { ascending: false })
    }

    const { data, count } = await query
    return { products: (data as unknown as CatalogoProduct[]) ?? [], total: count ?? 0 }
  } catch {
    return { products: [], total: 0 }
  }
}

// ─── SEO ──────────────────────────────────────────────────────────────────────

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { categoria } = await searchParams
  if (!categoria) {
    return {
      title: 'Catálogo — Vèloire',
      description: 'Explora nuestra colección completa de maquillaje artesanal.',
    }
  }
  try {
    const supabase = await createClient()
    const { data: catRows } = await supabase
      .from('categories')
      .select('name, description')
      .eq('slug', categoria)
      .limit(1)
    const cat = (catRows as Array<{ name: string; description: string | null }> | null)?.[0]
    return {
      title: `${cat?.name ?? 'Catálogo'} — Vèloire`,
      description: cat?.description ?? 'Explora nuestra colección de maquillaje.',
    }
  } catch {
    return { title: 'Catálogo — Vèloire' }
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CatalogoPage({ searchParams }: PageProps) {
  const { categoria, orden, pagina, q } = await searchParams
  const page = Math.max(1, parseInt(pagina ?? '1', 10) || 1)

  const [categories, { products, total }] = await Promise.all([
    getCategories(),
    getProducts(categoria, orden, page, q),
  ])

  const activeCategory = categories.find((c) => c.slug === categoria) ?? null
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      {/* Encabezado */}
      <div id="catalogo-top" className="mb-6">
        <h1 className="font-display text-3xl md:text-4xl text-fg">
          {q ? `Resultados para "${q}"` : activeCategory ? activeCategory.name : 'Colección completa'}
        </h1>
        {!q && activeCategory?.description && (
          <p className="font-body text-sm text-fg-2 mt-1 max-w-xl">
            {activeCategory.description}
          </p>
        )}
        <p className="font-body text-sm text-fg-3 mt-1">
          {total} {total === 1 ? 'producto' : 'productos'}
          {q ? ` encontrados` : activeCategory ? ` en ${activeCategory.name}` : ''}
        </p>
      </div>

      {/* Filtros — Client Component, no necesita Suspense porque no usa useSearchParams */}
      <CatalogoFilters
        categories={categories}
        activeCategory={categoria}
        activeOrder={orden}
      />

      <hr className="border-rim my-6" />

      {/* Grid con animaciones */}
      <ProductGrid
        products={products}
        filterKey={`${categoria ?? 'all'}-${orden ?? 'new'}-${page}`}
      />

      {/* Paginación */}
      {totalPages > 1 && (
        <CatalogoPagination
          currentPage={page}
          totalPages={totalPages}
          categoria={categoria}
          orden={orden}
        />
      )}
    </main>
  )
}
