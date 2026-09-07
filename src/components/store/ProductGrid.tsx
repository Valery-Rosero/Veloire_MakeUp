'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { PackageSearch } from 'lucide-react'
import Link from 'next/link'
import { ProductCard } from './ProductCard'
import type { CatalogoProduct } from '@/types/catalog'

interface ProductGridProps {
  products: CatalogoProduct[]
  filterKey: string
}

export function ProductGrid({ products, filterKey }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <PackageSearch size={48} className="mx-auto text-fg-3 mb-4" />
        <p className="font-display text-xl text-fg-2">No encontramos productos</p>
        <p className="font-body text-sm text-fg-3 mt-2">
          Prueba con otra categoría o explora toda la colección.
        </p>
        <Link
          href="/catalogo"
          className="inline-flex items-center mt-6 px-5 py-2.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
        >
          Ver todos los productos
        </Link>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={filterKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4 lg:gap-6"
      >
        {products.map((p, i) => {
          const mainImage = p.product_images?.find((img) => img.is_main) ?? p.product_images?.[0]
          const activeShades = p.product_shades?.filter((s) => s.is_active) ?? []
          const totalStock = activeShades.reduce((sum, s) => sum + (s.stock ?? 0), 0)
          return (
            <ProductCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              price={p.price}
              comparePrice={p.compare_price}
              imageUrl={mainImage?.url}
              imageAlt={mainImage?.alt_text}
              categoryName={p.categories?.name}
              shadeCount={activeShades.length}
              totalStock={totalStock}
              index={i}
              productId={p.id}
              categorySlug={p.categories?.slug}
            />
          )
        })}
      </motion.div>
    </AnimatePresence>
  )
}
