'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ProductDetail, ProductShade } from '@/types/product'
import { calculateDiscountPct } from '@/lib/format'
import { ShadeSelector } from './ShadeSelector'
import { ProductActions } from './ProductActions'
import { ProductDescription } from './ProductDescription'
import { ProductComparisonFacts } from './ProductComparisonFacts'

interface ProductClientProps {
  product: ProductDetail
}

function SplitProductName({ name }: { name: string }) {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) {
    return (
      <h1 className="font-display text-2xl md:text-3xl leading-snug" style={{ color: '#f5e1d3' }}>
        {name}
      </h1>
    )
  }
  const init = words.slice(0, -1).join(' ')
  const last = words[words.length - 1]
  return (
    <h1 className="font-display text-2xl md:text-3xl leading-snug" style={{ color: '#f5e1d3' }}>
      {init}{' '}
      <em style={{ fontStyle: 'italic', color: '#c08fa2' }}>{last}</em>
    </h1>
  )
}

export function ProductClient({ product }: ProductClientProps) {
  const activeShades = product.product_shades
    .filter((s) => s.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)

  const firstInStock = activeShades.find((s) => s.stock > 0) ?? activeShades[0] ?? null
  const [selectedShade, setSelectedShade] = useState<ProductShade | null>(firstInStock)

  const sortedImages = [...product.product_images].sort((_a, b) => (b.is_main ? 1 : -1))
  const [activeUrl, setActiveUrl] = useState<string | null>(
    firstInStock?.image_url ?? sortedImages[0]?.url ?? null
  )

  const discountPct = calculateDiscountPct(product.price, product.compare_price)

  const mainImage = sortedImages[0]

  function handleShadeSelect(shade: ProductShade | null) {
    setSelectedShade(shade)
    setActiveUrl(shade?.image_url ?? sortedImages[0]?.url ?? null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[45%_55%]">

      {/* ── Columna izquierda — imagen full-bleed con overlay ── */}
      <div
        className="relative overflow-hidden aspect-3/4 md:aspect-auto"
        style={{ backgroundColor: '#1a1a1a', minHeight: undefined }}
      >
        {/* reserva altura en desktop sin afectar el aspect-ratio en mobile */}
        <div className="hidden md:block" style={{ minHeight: '70vh' }} />
        {/* Imagen — llena toda la columna */}
        <AnimatePresence mode="sync">
          <motion.div
            key={activeUrl ?? 'empty'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {activeUrl ? (
              <Image
                src={activeUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span
                  className="font-display text-7xl select-none"
                  style={{ color: 'rgba(192,143,162,0.2)' }}
                >
                  V
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Overlay: oscuro arriba para texto, oscuro abajo para thumbnails */}
        {activeUrl && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, rgba(26,26,26,0.82) 0%, rgba(26,26,26,0.05) 40%, rgba(26,26,26,0.65) 82%, rgba(26,26,26,0.92) 100%)',
            }}
          />
        )}

        {/* Watermark */}
        <span
          className="absolute bottom-20 right-6 font-display select-none leading-none pointer-events-none z-10"
          style={{ fontSize: '100px', color: 'rgba(255,255,255,0.06)' }}
          aria-hidden
        >
          01
        </span>

        {/* Nombre y categoría — solo visible en desktop como overlay */}
        <div className="hidden md:block relative z-10 p-8 md:p-10">
          {product.categories && (
            <Link
              href={`/catalogo?categoria=${product.categories.slug}`}
              className="font-body uppercase hover:opacity-80 transition-opacity w-fit block mb-3"
              style={{ fontSize: '10px', letterSpacing: '3px', color: '#c08fa2' }}
            >
              {product.categories.name}
            </Link>
          )}
          <SplitProductName name={product.name} />
        </div>

        {/* Miniaturas en la parte inferior */}
        {sortedImages.length > 1 && (
          <div className="absolute bottom-0 inset-x-0 z-10 px-8 pb-6 md:px-10">
            <div className="flex gap-2 flex-wrap">
              {sortedImages.map((img) => {
                const isActive = activeUrl === img.url
                return (
                  <button
                    key={img.url}
                    onClick={() => setActiveUrl(img.url)}
                    aria-label={img.alt_text ?? product.name}
                    aria-pressed={isActive}
                    className="relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors duration-150"
                    style={{
                      borderColor: isActive ? '#c08fa2' : 'rgba(255,255,255,0.25)',
                    }}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt_text ?? product.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Columna derecha — zona clara ── */}
      <div className="flex flex-col gap-5 px-6 py-8 md:px-10 md:py-12 bg-page pb-20 md:pb-12">

        {/* Nombre + categoría — solo mobile (en desktop está en el overlay de la imagen) */}
        <div className="md:hidden">
          {product.categories && (
            <Link
              href={`/catalogo?categoria=${product.categories.slug}`}
              className="font-body uppercase hover:opacity-80 transition-opacity w-fit block mb-2"
              style={{ fontSize: '10px', letterSpacing: '3px', color: '#c08fa2' }}
            >
              {product.categories.name}
            </Link>
          )}
          <SplitProductName name={product.name} />
        </div>

        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-xs font-body text-fg-3 flex-wrap"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-accent transition-colors">Inicio</Link>
          <ChevronRight size={12} aria-hidden />
          <Link href="/catalogo" className="hover:text-accent transition-colors">Catálogo</Link>
          {product.categories && (
            <>
              <ChevronRight size={12} aria-hidden />
              <Link
                href={`/catalogo?categoria=${product.categories.slug}`}
                className="hover:text-accent transition-colors"
              >
                {product.categories.name}
              </Link>
            </>
          )}
          <ChevronRight size={12} aria-hidden />
          <span className="text-fg-2 truncate max-w-40">{product.name}</span>
        </nav>

        {/* Precio */}
        <div className="flex items-center gap-3">
          <span className="font-display text-[28px] leading-none text-fg">
            ${product.price.toLocaleString('es-CO')}
          </span>
          {product.compare_price && product.compare_price > product.price && (
            <>
              <span className="font-body text-base text-fg-3 line-through">
                ${product.compare_price.toLocaleString('es-CO')}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-highlight text-accent text-xs font-body font-medium">
                −{discountPct}%
              </span>
            </>
          )}
        </div>

        {/* Selector de tono */}
        {activeShades.length > 0 && (
          <div>
            <p className="text-sm font-body font-medium text-fg mb-2.5">
              Tono:{' '}
              <span className="font-normal text-fg-2">{selectedShade?.name ?? '—'}</span>
            </p>
            <ShadeSelector
              shades={activeShades}
              selectedShade={selectedShade}
              onSelect={handleShadeSelect}
            />
          </div>
        )}

        {/* Stock del tono seleccionado */}
        {activeShades.length > 0 && selectedShade && (
          <p className="text-xs font-body flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                selectedShade.stock > 5
                  ? 'bg-success'
                  : selectedShade.stock > 0
                  ? 'bg-warning'
                  : 'bg-error'
              }`}
            />
            <span className={selectedShade.stock === 0 ? 'text-error' : 'text-fg-3'}>
              {selectedShade.stock === 0 ? 'Agotado' : `${selectedShade.stock} disponibles`}
            </span>
          </p>
        )}

        <hr className="border-rim" />

        {/* Acciones */}
        <ProductActions
          productId={product.id}
          productName={product.name}
          price={product.price}
          imageUrl={mainImage?.url ?? null}
          selectedShade={selectedShade}
        />

        {/* Descripción */}
        {product.description && (
          <ProductDescription description={product.description} />
        )}

        {/* Ficha técnica */}
        {product.categories && (
          <ProductComparisonFacts
            categorySlug={product.categories.slug}
            comparison={product.comparison}
          />
        )}

        {/* Info bullets */}
        <div className="mt-auto space-y-1.5 pt-2">
          <p className="text-xs font-body text-fg-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
            Envíos a Pasto · Pago por Nequi o Bancolombia
          </p>
          <p className="text-xs font-body text-fg-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
            Atención personalizada por WhatsApp
          </p>
        </div>
      </div>
    </div>
  )
}
