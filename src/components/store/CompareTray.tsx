'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Scale } from 'lucide-react'
import { useCompareStore } from '@/lib/store/compare'

export function CompareTray() {
  const productIds = useCompareStore((s) => s.productIds)
  const clear = useCompareStore((s) => s.clear)

  return (
    <AnimatePresence>
      {productIds.length >= 2 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-4 left-4 z-40 flex items-center gap-3 bg-card border border-rim rounded-2xl shadow-lg px-4 py-3"
        >
          <Scale size={16} className="text-accent shrink-0" />
          <span className="font-body text-sm text-fg whitespace-nowrap">
            {productIds.length} producto{productIds.length !== 1 ? 's' : ''} para comparar
          </span>
          <Link
            href="/comparar"
            className="font-body text-sm font-medium px-3 py-1.5 rounded-xl bg-noir text-beige hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Comparar
          </Link>
          <button
            onClick={clear}
            aria-label="Limpiar comparación"
            className="text-fg-3 hover:text-fg transition-colors"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
