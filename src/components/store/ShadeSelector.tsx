'use client'

import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ProductShade } from '@/types/product'

const SHADE_LIMIT = 7

interface ShadeSelectorProps {
  shades: ProductShade[]
  selectedShade: ProductShade | null
  onSelect: (shade: ProductShade) => void
}

interface ShadeCircleProps {
  shade: ProductShade
  isSelected: boolean
  onSelect: (shade: ProductShade) => void
  /** layoutId compartido del anillo de selección (único por selector). */
  ringId: string
}

function ShadeCircle({ shade, isSelected, onSelect, ringId }: ShadeCircleProps) {
  const [hovered, setHovered] = useState(false)
  const isOutOfStock = shade.stock === 0

  return (
    <div className="relative">
      <motion.button
        onClick={() => !isOutOfStock && onSelect(shade)}
        disabled={isOutOfStock}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.12 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-label={`${shade.name}${isOutOfStock ? ' — agotado' : ''}`}
        aria-pressed={isSelected}
        className={`relative w-9 h-9 rounded-full transition-opacity duration-150 ${
          isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        style={{ backgroundColor: shade.hex_color }}
      >
        {/* Agotado diagonal line */}
        {isOutOfStock && (
          <span
            className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center pointer-events-none"
            aria-hidden
          >
            <span className="block w-px h-8 bg-white/70 rotate-45" />
          </span>
        )}
      </motion.button>

      {/* Anillo de selección: un solo elemento (layoutId) que se desliza de un
          tono al otro. Queda 2.5px por fuera del círculo y deja ver el fondo
          en medio, igual que el anillo doble que había antes. */}
      {isSelected && (
        <motion.span
          layoutId={ringId}
          className="absolute -inset-[4.5px] rounded-full pointer-events-none"
          style={{ boxShadow: 'inset 0 0 0 2px var(--accent-rose)' }}
          transition={{ type: 'spring', stiffness: 500, damping: 36 }}
          aria-hidden
        />
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-10"
          >
            <div className="px-2 py-1 rounded-md bg-fg text-card text-[11px] font-body whitespace-nowrap shadow-sm">
              {shade.name}
              {isOutOfStock && (
                <span className="text-fg-3 opacity-70"> · Agotado</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ShadeSelector({ shades, selectedShade, onSelect }: ShadeSelectorProps) {
  const [expanded, setExpanded] = useState(false)
  const ringId = `shade-ring-${useId()}`

  const visible = expanded ? shades : shades.slice(0, SHADE_LIMIT)
  const hiddenCount = shades.length - SHADE_LIMIT
  const hasMore = !expanded && hiddenCount > 0

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {visible.map((shade) => (
        <ShadeCircle
          key={shade.id}
          shade={shade}
          isSelected={selectedShade?.id === shade.id}
          onSelect={onSelect}
          ringId={ringId}
        />
      ))}

      {hasMore && (
        <button
          onClick={() => setExpanded(true)}
          aria-label={`Mostrar ${hiddenCount} tonos más`}
          className="w-9 h-9 rounded-full border border-rim-2 bg-card text-xs font-body font-medium text-fg-2 hover:border-accent hover:text-accent transition-colors duration-150 flex items-center justify-center"
        >
          +{hiddenCount}
        </button>
      )}
    </div>
  )
}
