'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Check, X as XIcon, Trash2 } from 'lucide-react'
import { useCompareStore } from '@/lib/store/compare'
import { getProductsForCompare, type CompareProduct } from '@/app/(store)/comparar/actions'
import { getCommonFields } from '@/lib/comparison-fields'

export function CompareTable() {
  const productIds = useCompareStore((s) => s.productIds)
  const remove = useCompareStore((s) => s.remove)
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

  if (productIds.length < 2) {
    return (
      <div className="text-center py-16">
        <p className="font-body text-fg-2 mb-4">
          Agrega al menos 2 productos desde el catálogo para compararlos.
        </p>
        <Link
          href="/catalogo"
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
        >
          Ver catálogo
        </Link>
      </div>
    )
  }

  if (loading) {
    return <p className="font-body text-sm text-fg-3 text-center py-16">Cargando...</p>
  }

  const categorySlugs = products.map((p) => p.categories?.slug).filter((s): s is string => !!s)
  const fields = getCommonFields(categorySlugs)

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[600px]">
        <thead>
          <tr>
            <th className="sticky left-0 bg-page z-10 w-36" />
            {products.map((p) => {
              const mainImage = p.product_images.find((img) => img.is_main) ?? p.product_images[0]
              return (
                <th key={p.id} className="p-2 text-left align-top min-w-[160px] font-normal">
                  <div className="bg-card border border-rim rounded-xl p-3 relative">
                    <button
                      onClick={() => remove(p.id)}
                      aria-label="Quitar de la comparación"
                      className="absolute top-1.5 right-1.5 text-fg-3 hover:text-error transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-alt mb-2">
                      {mainImage && (
                        <Image
                          src={mainImage.url}
                          alt={mainImage.alt_text ?? p.name}
                          fill
                          sizes="160px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <Link
                      href={`/producto/${p.slug}`}
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
              <td colSpan={products.length + 1} className="text-center py-8 font-body text-sm text-fg-3">
                Estos productos no tienen campos de comparación en común.
              </td>
            </tr>
          ) : (
            fields.map((f) => (
              <tr key={f.key} className="border-t border-rim">
                <td className="sticky left-0 bg-page z-10 py-3 pr-4 font-body text-xs font-medium text-fg-3 uppercase tracking-wide align-top">
                  {f.label}
                </td>
                {products.map((p) => {
                  const value = p.comparison?.[f.key] ?? ''
                  return (
                    <td key={p.id} className="py-3 px-3 font-body text-sm text-fg align-top">
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
