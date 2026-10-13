'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Check, X as XIcon, Trash2 } from 'lucide-react'
import { useCompareStore } from '@/lib/store/compare'
import { getProductsForCompare, type CompareProduct } from '@/lib/compare-actions'
import { getCommonFields } from '@/lib/comparison-fields'

// Ancho de la columna de etiquetas en celular (w-24) y mínimo por producto.
const LABEL_COL_PX = 96
const PRODUCT_COL_MIN_PX = 135

export function CompareTable() {
  const productIds = useCompareStore((s) => s.productIds)
  const remove = useCompareStore((s) => s.remove)
  const close = useCompareStore((s) => s.close)
  const [products, setProducts] = useState<CompareProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getProductsForCompare(productIds).then((rows) => {
      if (!active) return
      // Mantiene el orden en el que se fueron agregando.
      const ordered = productIds
        .map((id) => rows.find((r) => r.id === id))
        .filter((r): r is CompareProduct => !!r)
      setProducts(ordered)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [productIds])

  if (loading) {
    return <p className="font-body text-sm text-fg-3 text-center py-16">Cargando...</p>
  }

  // Al quitar un producto desaparece al instante, sin esperar la nueva consulta.
  const visible = products.filter((p) => productIds.includes(p.id))
  const categorySlugs = visible.map((p) => p.categories?.slug).filter((s): s is string => !!s)
  const fields = getCommonFields(categorySlugs)

  return (
    <div className="overflow-x-auto">
      {/* Ancho mínimo según cuántos productos hay: 2 caben en un celular sin
          scroll lateral; con 3-4 se desliza de lado y la columna de etiquetas
          queda fija a la izquierda. */}
      <table
        className="w-full table-fixed border-collapse"
        style={{ minWidth: LABEL_COL_PX + visible.length * PRODUCT_COL_MIN_PX }}
      >
        <thead>
          <tr>
            <th className="sticky left-0 bg-card z-10 w-24 md:w-36" />
            {visible.map((p) => {
              const mainImage = p.product_images.find((img) => img.is_main) ?? p.product_images[0]
              return (
                <th key={p.id} className="p-1.5 md:p-2 text-left align-top font-normal">
                  <div className="bg-card border border-rim rounded-xl p-3 relative">
                    <button
                      onClick={() => remove(p.id)}
                      aria-label="Quitar de la comparación"
                      className="absolute top-1.5 right-1.5 text-fg-3 hover:text-error transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="relative h-32 md:h-40 rounded-lg overflow-hidden bg-alt mb-2">
                      {mainImage && (
                        <Image
                          src={mainImage.url}
                          alt={mainImage.alt_text || p.name}
                          fill
                          sizes="240px"
                          className="object-contain"
                        />
                      )}
                    </div>
                    <Link
                      href={`/producto/${p.slug}`}
                      onClick={close}
                      className="font-display text-sm text-fg hover:text-accent transition-colors line-clamp-2 block"
                    >
                      {p.name}
                    </Link>
                    <p className="font-body text-sm font-medium text-accent-gold mt-1">
                      ${p.price.toLocaleString('es-CO')}
                    </p>
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {fields.length === 0 ? (
            <tr>
              <td colSpan={visible.length + 1} className="text-center py-8 font-body text-sm text-fg-3">
                Estos productos no tienen campos de comparación en común.
              </td>
            </tr>
          ) : (
            fields.map((f) => (
              <tr key={f.key} className="border-t border-rim">
                <td className="sticky left-0 bg-card z-10 py-3 pr-2 md:pr-4 font-body text-[11px] md:text-xs font-medium text-fg-3 uppercase tracking-wide align-top">
                  {f.label}
                </td>
                {visible.map((p) => {
                  const value = p.comparison?.[f.key] ?? ''
                  return (
                    <td key={p.id} className="py-3 px-2 md:px-3 font-body text-sm text-fg align-top">
                      {f.type === 'boolean' ? (
                        value === 'Sí' ? (
                          <Check size={16} className="text-success" />
                        ) : value === 'No' ? (
                          <XIcon size={16} className="text-fg-3" />
                        ) : (
                          <span className="text-fg-3">—</span>
                        )
                      ) : (
                        value || <span className="text-fg-3">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
