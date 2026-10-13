'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import type { ProductImage } from '@/types/product'

interface ProductGalleryProps {
  images: ProductImage[]
  shadeImageUrl: string | null
  productName: string
  dark?: boolean
}

export function ProductGallery({ images, shadeImageUrl, productName, dark = false }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => (b.is_main ? 1 : -1))
  const defaultUrl = sorted[0]?.url ?? null

  const [activeUrl, setActiveUrl] = useState<string | null>(defaultUrl)

  // Sync activeUrl cuando cambia la imagen del tono (sin useEffect)
  const [prevShadeUrl, setPrevShadeUrl] = useState(shadeImageUrl)
  if (prevShadeUrl !== shadeImageUrl) {
    setPrevShadeUrl(shadeImageUrl)
    setActiveUrl(shadeImageUrl !== null ? shadeImageUrl : defaultUrl)
  }

  const imgBg = dark ? 'bg-transparent' : 'bg-alt'
  const thumbActiveBorder = dark ? 'border-[#c08fa2]' : 'border-accent'
  const thumbInactiveBorder = dark ? 'border-transparent hover:border-white/30' : 'border-transparent hover:border-rim-2'
  const placeholderText = dark ? 'text-[#c08fa2]/30' : 'text-accent/30'

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Imagen principal con crossfade */}
      <div className={`relative aspect-3/4 md:aspect-auto md:flex-1 rounded-2xl overflow-hidden ${imgBg}`}>
        {activeUrl ? (
          <AnimatePresence mode="sync">
            <motion.div
              key={activeUrl}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Image
                src={activeUrl}
                alt={productName}
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-contain"
                priority
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className={`font-display text-4xl select-none ${placeholderText}`}>V</span>
          </div>
        )}
      </div>

      {/* Miniaturas */}
      {sorted.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {sorted.map((img) => {
            const isActive = activeUrl === img.url
            return (
              <button
                key={img.url}
                onClick={() => setActiveUrl(img.url)}
                aria-label={img.alt_text || productName}
                aria-pressed={isActive}
                className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors duration-150 ${
                  isActive ? thumbActiveBorder : thumbInactiveBorder
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt_text || productName}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
