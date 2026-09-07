import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { CategoryForm } from '@/components/admin/CategoryForm'

interface CategoryData {
  id: string
  name: string
  slug: string
  sku_prefix: string
  description: string | null
  image_url: string | null
  face_region: string | null
  is_active: boolean
  sort_order: number
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarCategoriaPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createAdminClient()

  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, sku_prefix, description, image_url, face_region, is_active, sort_order')
    .eq('id', id)
    .limit(1)

  const category = (data as CategoryData[] | null)?.[0]
  if (!category) notFound()

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/categorias"
          className="inline-flex items-center gap-1 text-sm font-body text-fg-2 hover:text-fg transition-colors"
        >
          <ArrowLeft size={14} />
          Categorías
        </Link>
        <span className="text-fg-3">/</span>
        <span className="font-body text-sm text-fg">Editar</span>
      </div>

      <h1 className="font-display text-2xl text-fg mb-6">Editar: {category.name}</h1>

      <CategoryForm
        initialData={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          sku_prefix: category.sku_prefix,
          description: category.description ?? '',
          image_url: category.image_url ?? '',
          face_region: category.face_region,
          is_active: category.is_active,
          sort_order: category.sort_order,
        }}
      />
    </div>
  )
}
