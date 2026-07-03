import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CategoryForm } from '@/components/admin/CategoryForm'

export default function NuevaCategoriaPage() {
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
        <span className="font-body text-sm text-fg">Nueva categoría</span>
      </div>

      <h1 className="font-display text-2xl text-fg mb-6">Nueva categoría</h1>

      <CategoryForm />
    </div>
  )
}
