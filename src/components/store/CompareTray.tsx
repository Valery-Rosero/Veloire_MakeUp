'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X, Scale } from 'lucide-react'
import { useCompareStore, MAX_COMPARE } from '@/lib/store/compare'

export function CompareTray() {
  const productIds = useCompareStore((s) => s.productIds)
  const limitNotice = useCompareStore((s) => s.limitNotice)
  const limitHits = useCompareStore((s) => s.limitHits)
  const clear = useCompareStore((s) => s.clear)
  const isOpen = useCompareStore((s) => s.isOpen)
  const open = useCompareStore((s) => s.open)

  const count = productIds.length
  const ready = count >= 2
  const full = count >= MAX_COMPARE

  // Texto principal según el estado. En móvil va una versión corta para no
  // chocar con el botón de WhatsApp (abajo a la derecha).
  let title: { long: string; short: string }
  if (limitNotice) {
    title = { long: `Máximo ${MAX_COMPARE} — quita uno para agregar otro`, short: `Máximo ${MAX_COMPARE} — quita uno` }
  } else if (full) {
    title = { long: `${count} productos · máximo`, short: `${count} · máximo` }
  } else if (ready) {
    title = { long: `${count} productos listos`, short: `${count} listos` }
  } else {
    title = { long: 'Elige otro producto para comparar', short: 'Elige 1 más para comparar' }
  }

  return (
    <AnimatePresence>
      {count >= 1 && !isOpen && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-4 left-4 z-40 max-w-[calc(100vw-6rem)] sm:max-w-none"
        >
          {/* La key reinicia la sacudida en cada intento rechazado */}
          <motion.div
            key={limitHits}
            initial={{ x: 0 }}
            animate={{ x: limitHits ? [0, -6, 6, -4, 4, 0] : 0 }}
            transition={{ duration: 0.35 }}
            className={`flex items-center gap-3 bg-card border rounded-2xl shadow-lg px-4 py-3 transition-colors ${
              limitNotice ? 'border-accent' : 'border-rim'
            }`}
          >
            <Scale size={16} className="text-accent shrink-0" />
            <div className="min-w-0" aria-live="polite">
              <p className={`font-body text-sm leading-tight ${limitNotice ? 'text-accent' : 'text-fg'}`}>
                <span className="sm:hidden">{title.short}</span>
                <span className="hidden sm:inline whitespace-nowrap">{title.long}</span>
              </p>
              {!ready && !limitNotice && (
                <p className="hidden sm:block font-body text-[11px] text-fg-3 mt-0.5">
                  Puedes comparar hasta {MAX_COMPARE}
                </p>
              )}
            </div>
            {ready ? (
              <button
                type="button"
                onClick={open}
                aria-haspopup="dialog"
                className="font-body text-sm font-medium px-3 py-1.5 rounded-xl bg-noir text-beige hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
              >
                Comparar →
              </button>
            ) : (
              <span
                aria-disabled="true"
                title="Elige al menos 2 productos"
                className="font-body text-sm font-medium px-3 py-1.5 rounded-xl bg-alt text-fg-3 cursor-not-allowed whitespace-nowrap shrink-0"
              >
                Comparar
              </span>
            )}
            <button
              type="button"
              onClick={clear}
              aria-label="Limpiar comparación"
              className="text-fg-3 hover:text-fg transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
