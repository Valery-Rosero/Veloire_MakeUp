import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ProductDetail } from '@/types/product'
import { ProductClient } from '@/components/store/ProductClient'
import { ProductCard } from '@/components/store/ProductCard'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RelatedProduct {
  id: string
  slug: string
  name: string
  price: number
  compare_price: number | null
  product_images: Array<{ url: string; alt_text: string | null; is_main: boolean }>
  product_shades: Array<{ hex_color: string; stock: number; is_active: boolean }>
  categories: { name: string; slug: string } | null
}

interface PageProps {
  params: Promise<{ slug: string }>
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

const getProduct = cache(async (slug: string): Promise<ProductDetail | null> => {
  try {
    const supabase = await createClient()
    const { data: rows } = await supabase
      .from('products')
      .select(`
        id, category_id, name, slug, sku, description, comparison, price, compare_price,
        meta_title, meta_description,
        product_images(url, alt_text, is_main),
        product_shades(id, name, hex_color, image_url, stock, is_active, sort_order),
        categories(name, slug)
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .limit(1)
    return (rows as ProductDetail[] | null)?.[0] ?? null
  } catch {
    return null
  }
})

async function getRelatedProducts(product: ProductDetail): Promise<RelatedProduct[]> {
  try {
    const supabase = await createClient()
    const select = `
      id, slug, name, price, compare_price,
      product_images(url, alt_text, is_main),
      product_shades(hex_color, stock, is_active),
      categories(name, slug)
    `

    const { data: sameCategory } = await supabase
      .from('products')
      .select(select)
      .eq('category_id', product.category_id)
      .eq('status', 'active')
      .neq('id', product.id)
      .limit(4)

    const related = (sameCategory as RelatedProduct[] | null) ?? []
    if (related.length >= 4) return related.slice(0, 4)

    const needed = 4 - related.length
    const excludeIds = [product.id, ...related.map((p) => p.id)]

    const { data: others } = await supabase
      .from('products')
      .select(select)
      .eq('status', 'active')
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .limit(needed)

    return [...related, ...((others as RelatedProduct[] | null) ?? [])].slice(0, 4)
  } catch {
    return []
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return {}

  const title = product.meta_title ?? product.name
  const description =
    product.meta_description ?? product.description ?? `Descubre ${product.name} en Vèloire`
  const mainImage =
    product.product_images.find((img) => img.is_main) ?? product.product_images[0]

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(mainImage
        ? { images: [{ url: mainImage.url, alt: mainImage.alt_text ?? product.name }] }
        : {}),
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductoPage({ params }: PageProps) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const related = await getRelatedProducts(product)

  const totalStock = product.product_shades
    .filter((s) => s.is_active)
    .reduce((sum, s) => sum + s.stock, 0)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    ...(product.product_images.length > 0
      ? { image: product.product_images.map((img) => img.url) }
      : {}),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'COP',
      availability:
        totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        {/* Layout inmersivo sin padding externo para que las columnas sean fluidas */}
        <div className="max-w-7xl mx-auto">
          <ProductClient product={product} />
        </div>

        {related.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 mt-16 md:mt-20 pb-16">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-0.5 h-8 bg-accent mt-1 shrink-0" />
              <h2 className="font-display text-2xl text-fg">También te puede gustar</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p, i) => {
                const mainImg =
                  p.product_images.find((img) => img.is_main) ?? p.product_images[0]
                const relatedStock = p.product_shades
                  .filter((s) => s.is_active)
                  .reduce((sum, s) => sum + s.stock, 0)
                return (
                  <ProductCard
                    key={p.id}
                    slug={p.slug}
                    name={p.name}
                    price={p.price}
                    comparePrice={p.compare_price}
                    imageUrl={mainImg?.url}
                    imageAlt={mainImg?.alt_text}
                    categoryName={p.categories?.name}
                    shadeCount={p.product_shades.filter((s) => s.is_active).length}
                    totalStock={relatedStock}
                    index={i}
                  />
                )
              })}
            </div>
          </section>
        )}
      </main>
    </>
  )
}
