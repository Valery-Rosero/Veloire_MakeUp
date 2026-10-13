'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface CarouselProduct {
  id: string
  slug: string
  name: string
  price: number
  compare_price: number | null
  product_images: Array<{ url: string; alt_text: string | null; is_main: boolean }>
  product_shades: Array<{ id: string; hex_color: string; is_active: boolean; stock: number }>
  categories: { name: string } | null
}

export function NewArrivalsCarousel({ products }: { products: CarouselProduct[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const syncButtons = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 8)
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }, [])

  useEffect(() => {
    syncButtons()
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(syncButtons)
    ro.observe(el)
    return () => ro.disconnect()
  }, [syncButtons])

  const scroll = useCallback((dir: 'prev' | 'next') => {
    const el = scrollRef.current
    if (!el) return
    const card = el.querySelector('[data-card]') as HTMLElement | null
    const step = card ? card.offsetWidth + 16 : 260
    el.scrollBy({ left: dir === 'next' ? step : -step, behavior: 'smooth' })
  }, [])

  if (products.length === 0) return null

  return (
    <div className="relative group/nav">
      {/* Track */}
      <div
        ref={scrollRef}
        onScroll={syncButtons}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1 scroll-smooth [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {/* Leading spacer on mobile */}
        <div className="shrink-0 w-4 md:w-0" aria-hidden />

        {products.map((product, i) => {
          const mainImage =
            product.product_images?.find((img) => img.is_main) ??
            product.product_images?.[0]
          const activeShades =
            product.product_shades?.filter((s) => s.is_active && s.stock > 0) ?? []
          const discountPct =
            product.compare_price && product.compare_price > product.price
              ? Math.round((1 - product.price / product.compare_price) * 100)
              : null

          return (
            <motion.div
              key={product.id}
              data-card
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: Math.min(i * 0.06, 0.3) }}
              className="shrink-0 snap-start w-[68vw] sm:w-56 md:w-60 lg:w-64"
            >
              <Link href={`/producto/${product.slug}`} className="group block">
                {/* Card */}
                <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-alt shadow-sm">
                  {/* Product image */}
                  {mainImage ? (
                    <Image
                      src={mainImage.url}
                      alt={mainImage.alt_text || product.name}
                      fill
                      sizes="(max-width: 640px) 68vw, (max-width: 768px) 224px, (max-width: 1024px) 240px, 256px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-display text-5xl text-accent select-none">V</span>
                    </div>
                  )}

                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />

                  {/* Badges — top right */}
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-accent text-white text-[10px] font-body font-semibold tracking-widest uppercase">
                      Nuevo
                    </span>
                    {discountPct && (
                      <span className="px-2 py-0.5 rounded-full bg-gold-light text-gold text-[10px] font-body font-semibold">
                        −{discountPct}%
                      </span>
                    )}
                  </div>

                  {/* Bottom text overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-4">
                    {product.categories?.name && (
                      <p className="text-[10px] font-body font-medium text-white/55 uppercase tracking-[0.15em] mb-1.5">
                        {product.categories.name}
                      </p>
                    )}

                    <h3 className="font-display text-[15px] leading-tight text-white mb-2">
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-body font-medium text-white">
                        ${product.price.toLocaleString('es-CO')}
                      </span>
                      {product.compare_price && product.compare_price > product.price && (
                        <span className="text-xs font-body text-white/45 line-through">
                          ${product.compare_price.toLocaleString('es-CO')}
                        </span>
                      )}
                    </div>

                    {/* Shade swatches */}
                    {activeShades.length > 0 && (
                      <div className="flex items-center gap-1 mb-3">
                        {activeShades.slice(0, 7).map((shade) => (
                          <div
                            key={shade.id}
                            title={undefined}
                            className="w-3 h-3 rounded-full border border-white/25 shrink-0"
                            style={{ backgroundColor: shade.hex_color }}
                          />
                        ))}
                        {activeShades.length > 7 && (
                          <span className="text-[10px] text-white/50 font-body ml-0.5">
                            +{activeShades.length - 7}
                          </span>
                        )}
                      </div>
                    )}

                    {/* CTA — appears on hover */}
                    <div
                      className="py-1.5 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm
                                 text-center text-xs font-body font-medium text-white
                                 translate-y-1 opacity-0
                                 group-hover:translate-y-0 group-hover:opacity-100
                                 transition-all duration-200 ease-out"
                    >
                      Ver producto
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}

        {/* Trailing spacer on mobile */}
        <div className="shrink-0 w-4 md:w-0" aria-hidden />
      </div>

      {/* Prev button */}
      <button
        onClick={() => scroll('prev')}
        disabled={!canPrev}
        aria-label="Anterior"
        className="absolute left-0 top-[45%] -translate-y-1/2 -translate-x-4 z-10
                   w-9 h-9 rounded-full bg-card border border-rim shadow-md
                   items-center justify-center text-fg
                   hover:bg-highlight disabled:opacity-0 disabled:pointer-events-none
                   transition-all duration-150
                   hidden md:flex"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Next button */}
      <button
        onClick={() => scroll('next')}
        disabled={!canNext}
        aria-label="Siguiente"
        className="absolute right-0 top-[45%] -translate-y-1/2 translate-x-4 z-10
                   w-9 h-9 rounded-full bg-card border border-rim shadow-md
                   items-center justify-center text-fg
                   hover:bg-highlight disabled:opacity-0 disabled:pointer-events-none
                   transition-all duration-150
                   hidden md:flex"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
