import Link from 'next/link'
import Image from 'next/image'
import { Plus, FileSpreadsheet } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/format'
import { ToggleProductStatus } from '@/components/admin/ToggleProductStatus'
import { DeleteProductButton } from '@/components/admin/DeleteProductButton'
import { ProductsSearch } from '@/components/admin/ProductsSearch'
import type { ProductStatus } from '@/types/database'
import type { ProductRow } from '@/types/catalog'

const STATUS_LABELS = { draft: 'Borrador', active: 'Activo', inactive: 'Inactivo' }
const STATUS_COLORS = {
  draft: 'bg-warning/15 text-warning',
  active: 'bg-success/15 text-success',
  inactive: 'bg-error/15 text-error',
}

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>
}

const PAGE_SIZE = 20

export default async function ProductosAdminPage({ searchParams }: PageProps) {
  const { status, q, page } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? '1', 10))
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createAdminClient()

  let query = supabase
    .from('products')
    .select(
      `id, name, slug, status, price, is_featured,
      categories(name),
      product_shades(id, stock, is_active),
      product_images(url, is_main)`,
      { count: 'exact' }
    )
    .order('name')
    .range(from, to)

  if (status && ['active', 'draft', 'inactive'].includes(status)) {
    query = query.eq('status', status as ProductStatus)
  }
  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  const { data, count } = await query
  const products = (data as ProductRow[] | null) ?? []
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-fg">Productos</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/productos/importar"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rim text-fg-2 text-sm font-body font-medium hover:bg-alt transition-colors"
          >
            <FileSpreadsheet size={15} />
            <span className="hidden sm:inline">Importar productos</span>
            <span className="sm:hidden">Excel</span>
          </Link>
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={15} />
            Nuevo producto
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {[
            { value: '', label: 'Todos' },
            { value: 'active', label: 'Activos' },
            { value: 'draft', label: 'Borradores' },
            { value: 'inactive', label: 'Inactivos' },
          ].map((opt) => (
            <Link
              key={opt.value}
              href={`/admin/productos${opt.value ? `?status=${opt.value}` : ''}`}
              className={`px-3 py-1.5 rounded-full text-xs font-body font-medium transition-colors ${
                status === opt.value || (!status && !opt.value)
                  ? 'bg-noir text-beige'
                  : 'bg-card border border-rim text-fg-2 hover:border-rim-2'
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
        <ProductsSearch defaultValue={q ?? ''} />
      </div>

      {/* Table */}
      <div className="bg-card border border-rim rounded-2xl overflow-hidden">
        {products.length === 0 ? (
          <p className="text-center font-body text-sm text-fg-3 py-12">No hay productos.</p>
        ) : (
          <>
            <div className="hidden lg:grid grid-cols-[48px_1fr_auto_auto_auto_auto_auto] gap-4 px-5 py-3 bg-alt border-b border-rim">
              <span />
              <span className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide">Nombre</span>
              <span className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide">Categoría</span>
              <span className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide">Precio</span>
              <span className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide">Tonos</span>
              <span className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide">Estado</span>
              <span className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide">Acciones</span>
            </div>
            <div className="divide-y divide-rim">
              {products.map((product) => {
                const mainImage = product.product_images.find((img) => img.is_main)?.url
                  ?? product.product_images[0]?.url ?? ''
                const activeShades = product.product_shades.filter((s) => s.is_active)
                const totalStock = activeShades.reduce((acc, s) => acc + s.stock, 0)
                const stockBadge =
                  totalStock === 0
                    ? <span className="text-[10px] font-body font-medium bg-error/15 text-error px-2 py-0.5 rounded-full">Agotado</span>
                    : totalStock <= 5
                    ? <span className="text-[10px] font-body font-medium bg-warning/15 text-warning px-2 py-0.5 rounded-full">Stock bajo</span>
                    : null

                return (
                  <div
                    key={product.id}
                    className="grid grid-cols-[48px_1fr] lg:grid-cols-[48px_1fr_auto_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-rim bg-alt shrink-0">
                      {mainImage ? (
                        <Image src={mainImage} alt={product.name} width={48} height={48} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-fg-3 text-xs">—</div>
                      )}
                    </div>

                    {/* Name */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-body text-sm font-medium text-fg truncate">{product.name}</p>
                        {product.is_featured && (
                          <span className="text-[10px] font-body text-accent bg-accent/10 px-1.5 py-0.5 rounded shrink-0">
                            Destacado
                          </span>
                        )}
                      </div>
                      <p className="font-body text-[11px] text-fg-3 truncate">{product.slug}</p>
                    </div>

                    {/* Category */}
                    <span className="hidden lg:block font-body text-sm text-fg-2 whitespace-nowrap">
                      {(product.categories as { name: string } | null)?.name ?? '—'}
                    </span>

                    {/* Price */}
                    <span className="hidden lg:block font-body text-sm font-medium text-fg whitespace-nowrap">
                      {formatPrice(product.price)}
                    </span>

                    {/* Shades + stock */}
                    <div className="hidden lg:flex flex-col items-end gap-0.5">
                      <span className="font-body text-sm text-fg-2 whitespace-nowrap">
                        {activeShades.length} tono{activeShades.length !== 1 ? 's' : ''}
                      </span>
                      {stockBadge}
                    </div>

                    {/* Status */}
                    <span
                      className={`hidden lg:inline-flex text-[11px] font-body font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLORS[product.status]}`}
                    >
                      {STATUS_LABELS[product.status]}
                    </span>

                    {/* Actions */}
                    <div className="hidden lg:flex items-center gap-3 whitespace-nowrap">
                      <Link
                        href={`/admin/productos/${product.id}/editar`}
                        className="text-fg-3 hover:text-accent transition-colors"
                        aria-label="Editar"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </Link>
                      <ToggleProductStatus productId={product.id} currentStatus={product.status} />
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/productos?${status ? `status=${status}&` : ''}${q ? `q=${q}&` : ''}page=${p}`}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-body transition-colors ${
                p === currentPage
                  ? 'bg-noir text-beige'
                  : 'bg-card border border-rim text-fg-2 hover:border-rim-2'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
