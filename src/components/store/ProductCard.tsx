'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Scale } from 'lucide-react'
import { calculateDiscountPct } from '@/lib/format'
import { useCompareStore } from '@/lib/store/compare'

interface ProductCardProps {
  slug: string
  name: string
  price: number
  comparePrice?: number | null
  imageUrl?: string | null
  imageAlt?: string | null
  categoryName?: string | null
  shadeCount?: number
  totalStock?: number
  index?: number
  variant?: 'a' | 'b'
  // Cuando se dan ambos (y la categoría no es "otros"), la variante 'a' muestra
  // un botón para agregar/quitar el producto del comparador.
  productId?: string
  categorySlug?: string | null
}

export function ProductCard({
  slug,
  name,
  price,
  comparePrice,
  imageUrl,
  imageAlt,
  categoryName,
  shadeCount,
  totalStock,
  index = 0,
  variant = 'a',
  productId,
  categorySlug,
}: ProductCardProps) {
  const isOutOfStock = totalStock !== undefined && totalStock === 0
  const discountPct = calculateDiscountPct(price, comparePrice)
  const compareIds = useCompareStore((s) => s.productIds)
  const toggleCompare = useCompareStore((s) => s.toggle)
  const canCompare = variant === 'a' && !!productId && categorySlug !== 'otros'
  const inCompare = canCompare && compareIds.includes(productId!)

  if (variant === 'b') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.25, ease: 'easeOut', delay: index * 0.06 }}
        className="group"
      >
        <Link href={`/producto/${slug}`} className="block">
          {/* ── Móvil: idéntico a variante A ── */}
          <div className="md:hidden">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-alt">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={imageAlt ?? name}
                  fill
                  sizes="50vw"
                  className={`object-cover transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? 'opacity-60' : ''}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-display text-4xl text-accent select-none">V</span>
                </div>
              )}
              <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                {categoryName && (
                  <span className="px-2 py-0.5 rounded-full bg-highlight text-accent text-[11px] font-body font-medium leading-tight">
                    {categoryName}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-3 px-0.5">
              <h3 className="font-display text-sm text-fg leading-snug">{name}</h3>
              <span className="text-sm font-body font-medium text-accent-gold mt-1 block">
                ${price.toLocaleString('es-CO')}
              </span>
            </div>
          </div>

          {/* ── Desktop: tarjeta editorial oscura ── */}
          <div
            className="hidden md:block relative aspect-square rounded-xl overflow-hidden"
            style={{ backgroundColor: '#1a1a1a' }}
          >
            {/* Imagen aparece en hover */}
            {imageUrl && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.35 }}
                transition={{ duration: 0.25 }}
              >
                <Image
                  src={imageUrl}
                  alt={imageAlt ?? name}
                  fill
                  sizes="25vw"
                  className="object-cover"
                />
              </motion.div>
            )}

            {/* Contenido editorial */}
            <div className="relative z-10 flex flex-col justify-end h-full p-4">
              {categoryName && (
                <p
                  className="font-body uppercase mb-2"
                  style={{ fontSize: '9px', letterSpacing: '2px', color: '#c08fa2' }}
                >
                  {categoryName}
                </p>
              )}
              <h3 className="font-display text-[15px] leading-snug mb-1" style={{ color: '#f5e1d3' }}>
                {name}
              </h3>
              {shadeCount !== undefined && shadeCount > 0 && (
                <p className="font-body text-[11px] mb-2" style={{ color: 'rgba(245,225,211,0.5)' }}>
                  {shadeCount} {shadeCount === 1 ? 'tono' : 'tonos'}
                </p>
              )}
              <div className="flex items-center gap-2">
                <span className="font-body text-sm font-medium" style={{ color: '#ed4a89' }}>
                  ${price.toLocaleString('es-CO')}
                </span>
                {comparePrice && comparePrice > price && (
                  <span className="font-body text-xs line-through" style={{ color: 'rgba(245,225,211,0.35)' }}>
                    ${comparePrice.toLocaleString('es-CO')}
                  </span>
                )}
              </div>
            </div>

            {/* Badges */}
            {discountPct && (
              <div className="absolute top-2 right-2">
                <span className="px-2 py-0.5 rounded-full bg-gold-light text-gold text-[11px] font-body font-medium leading-tight">
                  −{discountPct}%
                </span>
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-[11px] font-body font-medium leading-tight">
                  Agotado
                </span>
              </div>
            )}
          </div>
        </Link>
      </motion.div>
    )
  }

  // ── Variante A (clásica) ──────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.25, ease: 'easeOut', delay: index * 0.06 }}
      whileHover={{ y: -2 }}
      className="group relative"
    >
      {canCompare && (
        <button
          type="button"
          onClick={() => toggleCompare(productId!)}
          aria-pressed={inCompare}
          aria-label={inCompare ? 'Quitar de comparar' : 'Agregar a comparar'}
          className={`absolute top-2 right-2 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
            inCompare ? 'bg-accent text-white' : 'bg-card/90 text-fg-2 hover:text-accent'
          }`}
        >
          <Scale size={14} />
        </button>
      )}
      <Link href={`/producto/${slug}`} className="block">
        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-alt">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt ?? name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={`object-cover transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? 'opacity-60' : ''}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-display text-4xl text-accent select-none">V</span>
            </div>
          )}

          {/* Badges sobre imagen */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {categoryName && (
              <span className="px-2 py-0.5 rounded-full bg-highlight text-accent text-[11px] font-body font-medium leading-tight">
                {categoryName}
              </span>
            )}
            {discountPct && (
              <span className="px-2 py-0.5 rounded-full bg-gold-light text-gold text-[11px] font-body font-medium leading-tight">
                −{discountPct}%
              </span>
            )}
            {isOutOfStock && (
              <span className="px-2 py-0.5 rounded-full bg-alt text-fg-3 text-[11px] font-body font-medium leading-tight">
                Agotado
              </span>
            )}
          </div>

          {/* Botón hover */}
          <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 md:transition-transform md:duration-200 md:ease-out">
            <div className="bg-noir text-beige text-xs font-body font-medium text-center py-2 rounded-lg">
              Ver producto
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-3 px-0.5">
          <h3 className="font-display text-sm font-normal text-fg group-hover:text-accent transition-colors duration-150 leading-snug">
            {name}
          </h3>
          {shadeCount !== undefined && shadeCount > 0 && (
            <p className="text-[11px] font-body text-fg-2 mt-0.5">
              {shadeCount} {shadeCount === 1 ? 'tono' : 'tonos'}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-body font-medium text-accent-gold">
              ${price.toLocaleString('es-CO')}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="text-xs font-body text-fg-3 line-through">
                ${comparePrice.toLocaleString('es-CO')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
