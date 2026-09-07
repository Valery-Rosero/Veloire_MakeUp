import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { ProductImportWizard } from '@/components/admin/product-import/ProductImportWizard'
import type { Category } from '@/lib/store/product-import'

export default async function ImportarProductosPage() {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, sku_prefix')
    .eq('is_active', true)
    .order('sort_order')

  const categories = (data as Category[] | null) ?? []

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/admin/productos"
          className="flex items-center gap-1 text-sm font-body text-fg-2 hover:text-fg transition-colors"
        >
          <ArrowLeft size={14} />
          Productos
        </Link>
        <span className="text-fg-3">/</span>
        <span className="font-body text-sm text-fg">Importar productos</span>
      </div>

      <h1 className="font-display text-2xl text-fg mb-8">Importar productos desde Excel</h1>

      <ProductImportWizard categories={categories} />
    </div>
  )
}
