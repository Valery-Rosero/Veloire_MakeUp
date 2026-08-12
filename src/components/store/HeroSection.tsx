'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CarouselProduct } from '@/components/store/NewArrivalsCarousel'

// ─── Círculos flotantes ──────────────────────────────────────────────────────

const CIRCLES = [
  { color: '#8B2252', size: 220, top: '-5%',  left: '18%',  delay: 0.2, dur: 4.0, float: 16, z: 1 },
  { color: '#ed4a89', size: 190, top: '28%',  left: '-6%',  delay: 0.0, dur: 3.6, float: 15, z: 2 },
  { color: '#c08fa2', size: 145, top: '5%',   left: '50%',  delay: 0.5, dur: 4.2, float: 12, z: 3 },
  { color: '#D4A76A', size: 115, top: '48%',  left: '36%',  delay: 0.8, dur: 3.8, float: 10, z: 4 },
  { color: '#a56583', size: 88,  top: '58%',  left: '5%',   delay: 0.4, dur: 3.5, float: 8,  z: 5 },
  { color: '#f5b8cc', size: 70,  top: '0%',   left: '72%',  delay: 0.7, dur: 4.1, float: 10, z: 5 },
  { color: '#1a1a1a', size: 55,  top: '68%',  left: '62%',  delay: 1.0, dur: 3.9, float: 7,  z: 6 },
] as const

// ─── Spotlight de producto ────────────────────────────────────────────────────

function ProductSpotlight({ products }: { products: CarouselProduct[] }) {
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(1)

  useEffect(() => {
    if (products.length <= 1) return
    const t = setInterval(() => {
      setDir(1)
      setIdx((i) => (i + 1) % products.length)
    }, 4500)
    return () => clearInterval(t)
  }, [products.length])

  const go = (next: number) => {
    setDir(next > idx ? 1 : -1)
    setIdx(next)
  }

  const p = products[idx]
  const img = p.product_images?.find((x) => x.is_main) ?? p.product_images?.[0]

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={p.id}
          custom={dir}
          variants={{
            enter: (d: number) => ({ x: d * 24, opacity: 0, scale: 0.97 }),
            center: { x: 0, opacity: 1, scale: 1 },
            exit: (d: number) => ({ x: d * -24, opacity: 0, scale: 0.97 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0"
        >
          <Link href={`/producto/${p.slug}`} className="group block h-full">
            <div className="relative h-full rounded-3xl overflow-hidden bg-alt shadow-xl">
              {img ? (
                <Image
                  src={img.url}
                  alt={img.alt_text ?? p.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-alt">
                  <span className="font-display text-7xl text-accent select-none">V</span>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full bg-accent text-white text-[10px] font-body font-semibold tracking-widest uppercase">
                  Nuevo
                </span>
              </div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {products.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); go(i) }}
              aria-label={`Producto ${i + 1}`}
              className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${
                i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/35 hover:bg-white/65'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

interface HeroSectionProps {
  products?: CarouselProduct[]
}

export function HeroSection({ products = [] }: HeroSectionProps) {
  const hasProducts = products.length > 0

  return (
    <section className="relative overflow-hidden bg-alt h-[calc(100svh-64px)] md:h-[calc(100vh-123px)] flex items-center">
      {/* Círculo grande decorativo */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 600,
          height: 600,
          backgroundColor: '#c08fa2',
          opacity: 0.08,
          right: '-8%',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
      {/* Círculo pequeño decorativo */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 280,
          height: 280,
          backgroundColor: '#a56583',
          opacity: 0.06,
          left: '-4%',
          top: '-6%',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 w-full py-5 md:py-10">
        {/* ── Mobile: imagen arriba, texto abajo ── */}
        <div className="flex flex-col gap-8 md:hidden">

          {/* Imagen primero en mobile */}
          <motion.div
            className="relative w-full overflow-hidden rounded-2xl"
            style={{ height: '62vw', minHeight: 220, maxHeight: 340 }}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {hasProducts ? (
              <ProductSpotlight products={products} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-highlight rounded-2xl">
                <span className="font-display text-7xl text-accent select-none">V</span>
              </div>
            )}
          </motion.div>

          {/* Texto */}
          <motion.div
            className="flex flex-col items-start text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          >
            <p
              className="font-body uppercase text-accent mb-3"
              style={{ fontSize: '10px', letterSpacing: '3px' }}
            >
              Nueva colección · Pasto, Nariño
            </p>

            <h1 className="font-display leading-[1.08] tracking-tight text-[52px] text-fg mb-3">
              El maquillaje<br />que te hace<br />
              sentir{' '}
              <em className="text-accent" style={{ fontStyle: 'italic' }}>tú</em>
            </h1>

            <p className="font-body text-[14px] text-fg-2 leading-[1.7] mb-6 max-w-xs">
              Maquillaje para quienes lo usan como lo que es:
              una forma de crear.
            </p>

            <div className="flex items-center gap-5">
              <Link
                href="/catalogo"
                className="group inline-flex items-center gap-1.5 text-sm font-body font-medium text-accent hover:text-fg transition-colors duration-150"
              >
                Ver colección
                <ArrowRight size={13} className="transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/catalogo?orden=nuevo"
                className="inline-flex items-center text-sm font-body font-medium text-fg-2 hover:text-fg transition-colors duration-150"
              >
                Novedades
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ── Desktop: layout original 55/45 ── */}
        <div className="hidden md:grid grid-cols-[55%_45%] gap-10 items-center">

          {/* Columna izquierda */}
          <motion.div
            className="flex flex-col items-start text-left"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <p
              className="font-body uppercase text-accent mb-5"
              style={{ fontSize: '10px', letterSpacing: '3px' }}
            >
              Nueva colección · Pasto, Nariño
            </p>

            <h1 className="font-display leading-[1.08] tracking-tight mb-0">
              <span className="block text-[64px] text-fg">El maquillaje</span>
              <span className="block text-[64px] text-fg">que te hace</span>
              <span className="block text-[64px] text-fg">
                sentir{' '}
                <em className="text-accent" style={{ fontStyle: 'italic' }}>tú</em>
              </span>
            </h1>

            <div className="mt-5 mb-5 bg-rose-medium" style={{ width: '40px', height: '2px' }} />

            <p className="font-body text-[15px] text-fg-2 max-w-sm leading-[1.7] mb-8">
              Maquillaje para quienes lo usan como lo que es:
              una forma de crear.
            </p>

            <div className="flex flex-row items-center gap-3">
              <Link
                href="/catalogo"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
              >
                Ver colección
                <ArrowRight size={14} className="transition-transform duration-150 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/catalogo?orden=nuevo"
                className="inline-flex items-center justify-center py-3.5 text-sm font-body font-medium text-accent hover:text-fg transition-colors duration-150"
              >
                Novedades
              </Link>
            </div>
          </motion.div>

          {/* Columna derecha */}
          <motion.div
            className="relative h-130 overflow-hidden"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
          >
            {hasProducts ? (
              <ProductSpotlight products={products} />
            ) : (
              <div className="hidden min-[480px]:block absolute inset-0">
                {CIRCLES.map((c, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: c.size,
                      height: c.size,
                      top: c.top,
                      left: c.left,
                      backgroundColor: c.color,
                      zIndex: c.z,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
                    }}
                    animate={{ y: [0, -c.float, 0] }}
                    transition={{ duration: c.dur, repeat: Infinity, delay: c.delay, ease: 'easeInOut' }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
