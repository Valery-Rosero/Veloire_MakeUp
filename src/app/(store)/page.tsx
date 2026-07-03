import Link from 'next/link'
import Image from 'next/image'
import { Bike, Smartphone, Palette, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/store/ProductCard'
import { HeroSection } from '@/components/store/HeroSection'
import { FaceMap } from '@/components/store/FaceMap'
import { ShadeWall, type ShadeWallItem } from '@/components/store/ShadeWall'
import { type CarouselProduct } from '@/components/store/NewArrivalsCarousel'

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
  face_region: string | null
}

interface FeaturedProduct {
  id: string
  slug: string
  name: string
  price: number
  compare_price: number | null
  product_images: Array<{ url: string; alt_text: string | null; is_main: boolean }>
  product_shades: Array<{ id: string; name: string; hex_color: string; is_active: boolean; stock: number }>
  categories: { name: string } | null
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug, sort_order, face_region')
      .eq('is_active', true)
      .order('sort_order')
    return data ?? []
  } catch {
    return []
  }
}

async function getNewProducts(): Promise<CarouselProduct[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select(`
        id, slug, name, price, compare_price,
        product_images(url, alt_text, is_main),
        product_shades(id, hex_color, is_active, stock),
        categories(name)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(12)
    const products = (data as unknown as CarouselProduct[]) ?? []
    return products.filter((p) =>
      p.product_shades?.some((s) => s.is_active && s.stock > 0) ?? false
    )
  } catch {
    return []
  }
}

async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select(`
        id, slug, name, price, compare_price,
        product_images(url, alt_text, is_main),
        product_shades(id, name, hex_color, is_active, stock),
        categories(name)
      `)
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8)
    return (data as unknown as FeaturedProduct[]) ?? []
  } catch {
    return []
  }
}

async function getShadeWallItems(): Promise<ShadeWallItem[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('product_shades')
      .select('id, name, hex_color')
      .eq('is_active', true)
      .gt('stock', 0)
      .limit(14)
    if (!data) return []
    return (data as Array<{ id: string; name: string; hex_color: string }>).map((s) => ({
      id: s.id,
      name: s.name,
      hex_color: s.hex_color,
      productName: null,
    }))
  } catch {
    return []
  }
}

// ─── Secciones ────────────────────────────────────────────────────────────────

function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section className="py-12 md:py-16 border-b border-rim bg-page">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-0.5 h-6 bg-accent shrink-0" />
          <h2 className="font-display text-xl text-fg">Explora por zona</h2>
        </div>
        <FaceMap categories={categories} />
      </div>
    </section>
  )
}

// ─── Hero card del primer producto destacado ──────────────────────────────────

function HeroProductCard({ product, index }: { product: FeaturedProduct; index: number }) {
  const mainImage = product.product_images?.find((img) => img.is_main) ?? product.product_images?.[0]
  const activeShades = product.product_shades?.filter((s) => s.is_active) ?? []
  const firstShades = activeShades.slice(0, 5)
  const num = String(index + 1).padStart(2, '0')

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group relative flex flex-col justify-end rounded-2xl overflow-hidden col-span-2 row-span-2 min-h-80"
      style={{ backgroundColor: '#1a1a1a' }}
    >
      {/* Imagen con overlay */}
      {mainImage && (
        <div className="absolute inset-0">
          <Image
            src={mainImage.url}
            alt={mainImage.alt_text ?? product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover opacity-40 transition-transform duration-500 group-hover:scale-[1.03]"
            priority
          />
        </div>
      )}

      {/* Watermark numérico */}
      <span
        className="absolute top-4 right-5 font-display select-none leading-none"
        style={{ fontSize: '100px', color: 'rgba(255,255,255,0.05)' }}
        aria-hidden
      >
        {num}
      </span>

      {/* Badge */}
      <div className="absolute top-4 left-4">
        <span
          className="font-body text-[10px] font-medium uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ backgroundColor: '#f5e1d3', color: '#1a1a1a' }}
        >
          Destacado
        </span>
      </div>

      {/* Contenido inferior */}
      <div className="relative z-10 p-6">
        {product.categories && (
          <p
            className="font-body uppercase mb-2"
            style={{ fontSize: '10px', letterSpacing: '2px', color: '#c08fa2' }}
          >
            {product.categories.name}
          </p>
        )}
        <h3 className="font-display text-[22px] leading-snug mb-3" style={{ color: '#f5e1d3' }}>
          {product.name}
        </h3>

        {/* Tonos */}
        {firstShades.length > 0 && (
          <div className="flex items-center gap-1.5 mb-4">
            {firstShades.map((s) => (
              <span
                key={s.id}
                className="rounded-full border border-white/20 shrink-0"
                style={{ width: '14px', height: '14px', backgroundColor: s.hex_color }}
                title={s.name}
              />
            ))}
            {activeShades.length > 5 && (
              <span className="font-body text-[10px]" style={{ color: 'rgba(245,225,211,0.5)' }}>
                +{activeShades.length - 5}
              </span>
            )}
          </div>
        )}

        <p className="font-display text-xl font-normal" style={{ color: '#ed4a89' }}>
          ${product.price.toLocaleString('es-CO')}
        </p>
      </div>
    </Link>
  )
}

// ─── Card secundaria de destacados ───────────────────────────────────────────

function SecondaryProductCard({ product, index }: { product: FeaturedProduct; index: number }) {
  const mainImage = product.product_images?.find((img) => img.is_main) ?? product.product_images?.[0]
  const activeShades = product.product_shades?.filter((s) => s.is_active) ?? []
  const totalStock = activeShades.reduce((sum, s) => sum + (s.stock ?? 0), 0)

  return (
    <ProductCard
      slug={product.slug}
      name={product.name}
      price={product.price}
      comparePrice={product.compare_price}
      imageUrl={mainImage?.url}
      imageAlt={mainImage?.alt_text}
      categoryName={product.categories?.name}
      shadeCount={activeShades.length}
      totalStock={totalStock}
      index={index}
    />
  )
}

// ─── Sección de destacados asimétrica ────────────────────────────────────────

function FeaturedSection({ products }: { products: FeaturedProduct[] }) {
  const hero = products[0]
  const secondary = products.slice(1, 5)
  const overflow = products.slice(5)

  return (
    <section className="py-16 md:py-20 bg-page">
      <div className="max-w-7xl mx-auto px-4">

        {/* Encabezado */}
        <div className="flex items-start justify-between mb-10 md:mb-12">
          <div className="flex items-start gap-4">
            <div className="w-0.75 h-10 mt-1 shrink-0" style={{ backgroundColor: '#a56583' }} />
            <div>
              <h2 className="font-display text-2xl md:text-[28px] text-fg leading-tight">Destacados</h2>
              <p className="font-body text-sm text-accent mt-1" style={{ fontStyle: 'italic' }}>
                Los favoritos de nuestras clientas
              </p>
            </div>
          </div>
          <Link
            href="/catalogo"
            className="hidden sm:block text-sm font-body font-medium text-fg-2 hover:text-fg border border-rim hover:border-rim-2 px-4 py-1.5 rounded-lg transition-colors duration-150 mt-1"
          >
            Ver todos →
          </Link>
        </div>

        {products.length > 0 ? (
          <>
            {/* Grid asimétrico: hero 2×2 + 4 secundarios */}
            {hero && (
              <div className="hidden md:grid grid-cols-4 gap-4 md:gap-5">
                <HeroProductCard product={hero} index={0} />
                {secondary.map((p, i) => (
                  <SecondaryProductCard key={p.id} product={p} index={i + 1} />
                ))}
              </div>
            )}

            {/* Grid móvil: 2 columnas uniformes */}
            <div className="md:hidden grid grid-cols-2 gap-4">
              {products.slice(0, 5).map((p, i) => (
                <SecondaryProductCard key={p.id} product={p} index={i} />
              ))}
            </div>

            {/* Overflow — grid normal de 3 columnas */}
            {overflow.length > 0 && (
              <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                {overflow.map((p, i) => (
                  <SecondaryProductCard key={p.id} product={p} index={i + 5} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center">
            <p className="font-display text-xl text-fg-2">Próximamente</p>
            <p className="font-body text-sm text-fg-3 mt-2">
              Estamos preparando nuestra colección. Vuelve pronto.
            </p>
            <Link
              href="/catalogo"
              className="inline-flex items-center mt-6 px-5 py-2.5 rounded-lg bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
            >
              Ver catálogo
            </Link>
          </div>
        )}

        {/* Ver todos — móvil */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/catalogo"
            className="text-sm font-body font-medium text-accent hover:underline underline-offset-4"
          >
            Ver todos los productos →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Value Banner ─────────────────────────────────────────────────────────────

const VALUE_ITEMS = [
  { icon: Bike,          title: 'Envíos a Pasto',           description: 'Entregamos en toda la ciudad con rapidez y cuidado.' },
  { icon: Smartphone,    title: 'Pago fácil por Nequi',     description: 'Transfiere sin salir de casa. Rápido y seguro.' },
  { icon: Palette,       title: 'Tonos para todas',         description: 'Una paleta pensada para cada piel y cada tono.' },
  { icon: MessageCircle, title: 'Atención personalizada',   description: 'Te ayudamos a encontrar el tono ideal para ti.' },
]

function ValueBanner() {
  return (
    <section className="bg-alt border-y border-rim py-12 md:py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x md:divide-rim">
          {VALUE_ITEMS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center md:items-start text-center md:text-left gap-2 md:px-8 first:md:pl-0 last:md:pr-0"
            >
              <Icon size={20} className="text-accent shrink-0" />
              <p className="font-body text-sm font-medium text-fg">{title}</p>
              <p className="font-body text-xs text-fg-2 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [categories, newProducts, featuredProducts, shadeWallItems] = await Promise.all([
    getCategories(),
    getNewProducts(),
    getFeaturedProducts(),
    getShadeWallItems(),
  ])

  return (
    <>
      <HeroSection products={newProducts} />
      <CategoriesSection categories={categories} />
      <FeaturedSection products={featuredProducts} />

      <ValueBanner />
    </>
  )
}
