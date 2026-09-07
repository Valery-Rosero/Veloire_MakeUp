import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { ProductForm } from '@/components/admin/ProductForm'

interface Category {
  id: string
  name: string
  slug: string
}

export default async function NuevoProductoPage() {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name')

  const categories = (data as Category[] | null) ?? []

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
        <span className="font-body text-sm text-fg">Nuevo producto</span>
      </div>

      <h1 className="font-display text-2xl text-fg mb-6">Nuevo producto</h1>

      <ProductForm categories={categories} />
    </div>
  )
}
