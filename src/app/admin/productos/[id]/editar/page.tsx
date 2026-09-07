import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/ProductForm'

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductRow {
  id: string
  category_id: string
  name: string
  slug: string
  sku: string
  brand: string | null
  description: string | null
  comparison: Record<string, string> | null
  price: number
  compare_price: number | null
  status: 'draft' | 'active' | 'inactive'
  is_featured: boolean
  meta_title: string | null
  meta_description: string | null
  product_shades: Array<{
    id: string
    name: string
    hex_color: string
    stock: number
    image_url: string | null
    is_active: boolean
    sort_order: number
  }>
  product_images: Array<{
    url: string
    alt_text: string | null
    is_main: boolean
    sort_order: number
  }>
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarProductoPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createAdminClient()

  const [productResult, categoriesResult] = await Promise.all([
    supabase
      .from('products')
      .select(`
        id, category_id, name, slug, sku, brand, description, comparison, price, compare_price,
        status, is_featured, meta_title, meta_description,
        product_shades(id, name, hex_color, stock, image_url, is_active, sort_order),
        product_images(url, alt_text, is_main, sort_order)
      `)
      .eq('id', id)
      .limit(1),
    supabase.from('categories').select('id, name, slug').eq('is_active', true).order('name'),
  ])

  const product = (productResult.data as ProductRow[] | null)?.[0]
  if (!product) notFound()

  const categories = (categoriesResult.data as Category[] | null) ?? []

  const initialData = {
    id: product.id,
    category_id: product.category_id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    brand: product.brand,
    description: product.description ?? '',
    comparison: product.comparison ?? {},
    price: product.price,
    compare_price: product.compare_price,
    status: product.status,
    is_featured: product.is_featured,
    meta_title: product.meta_title ?? '',
    meta_description: product.meta_description ?? '',
    shades: product.product_shades
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((s) => ({
        id: s.id,
        name: s.name,
        hex_color: s.hex_color,
        stock: s.stock,
        image_url: s.image_url ?? '',
        is_active: s.is_active,
        sort_order: s.sort_order,
      })),
    images: product.product_images
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => ({
        url: img.url,
        alt_text: img.alt_text ?? '',
        is_main: img.is_main,
        sort_order: img.sort_order,
      })),
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/productos"
          className="inline-flex items-center gap-1 text-sm font-body text-fg-2 hover:text-fg transition-colors"
        >
          <ArrowLeft size={14} />
          Productos
        </Link>
        <span className="text-fg-3">/</span>
        <span className="font-body text-sm text-fg">Editar</span>
      </div>

      <h1 className="font-display text-2xl text-fg mb-6">Editar: {product.name}</h1>

      <ProductForm categories={categories} initialData={initialData} />
    </div>
  )
}
