import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { getFaceRegionLabel } from '@/lib/face-regions'

interface CategoryRow {
  id: string
  name: string
  slug: string
  face_region: string | null
  is_active: boolean
  sort_order: number
}

export default async function CategoriasPage() {
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, face_region, is_active, sort_order')
    .order('sort_order')

  const categories = (data as CategoryRow[] | null) ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-fg">Categorías</h1>
        <Link
          href="/admin/categorias/nueva"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} />
          Nueva categoría
        </Link>
      </div>

      <div className="bg-card border border-rim rounded-2xl overflow-hidden">
        {categories.length === 0 ? (
          <p className="text-center font-body text-sm text-fg-3 py-12">No hay categorías.</p>
        ) : (
          <>
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 bg-alt border-b border-rim">
              <span className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide">Nombre</span>
              <span className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide">Zona facial</span>
              <span className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide">Estado</span>
              <span />
            </div>
            <div className="divide-y divide-rim">
              {categories.map((cat) => {
                const zoneLabel = getFaceRegionLabel(cat.face_region)
                return (
                  <div
                    key={cat.id}
                    className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="font-body text-sm font-medium text-fg truncate">{cat.name}</p>
                      <p className="font-body text-[11px] text-fg-3 truncate">{cat.slug}</p>
                    </div>

                    <span className="hidden sm:block font-body text-sm text-fg-2 whitespace-nowrap">
                      {zoneLabel ?? <span className="text-fg-3 italic text-xs">Sin zona</span>}
                    </span>

                    <span
                      className={`hidden sm:inline-flex text-[11px] font-body font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                        cat.is_active
                          ? 'bg-success/15 text-success'
                          : 'bg-error/15 text-error'
                      }`}
                    >
                      {cat.is_active ? 'Activa' : 'Inactiva'}
                    </span>

                    <Link
                      href={`/admin/categorias/${cat.id}/editar`}
                      className="text-sm font-body font-medium text-accent hover:underline underline-offset-2 whitespace-nowrap"
                    >
                      Editar
                    </Link>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
