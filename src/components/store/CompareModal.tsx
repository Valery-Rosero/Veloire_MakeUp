'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useCompareStore } from '@/lib/store/compare'
import { useIsMobile } from '@/hooks/useIsMobile'
import { CompareTable } from '@/components/store/CompareTable'

// Ventana de comparación: se abre desde la barra flotante (CompareTray) y se
// cierra con la X, Esc, tocando afuera, al navegar, o sola si quedan menos de
// 2 productos (eso lo resuelve el store).
export function CompareModal() {
  const isOpen = useCompareStore((s) => s.isOpen)
  const count = useCompareStore((s) => s.productIds.length)
  const close = useCompareStore((s) => s.close)
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const closeRef = useRef<HTMLButtonElement>(null)

  // Cualquier cambio de página (incluido el botón "atrás") cierra la ventana.
  useEffect(() => {
    close()
  }, [pathname, close])

  useEffect(() => {
    if (!isOpen) return
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [isOpen, close])

  const content = (
    <>
      <div className="flex items-start justify-between gap-4 px-5 md:px-6 pt-4 md:pt-5 pb-3 border-b border-rim shrink-0">
        <div>
          <h2 id="compare-title" className="font-display text-xl md:text-2xl text-fg">
            Comparar productos
          </h2>
          <p className="font-body text-xs text-fg-3 mt-0.5">
            {count} productos · solo se muestran las características que tienen en común
          </p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Cerrar comparación"
          className="w-9 h-9 -mr-1.5 rounded-full flex items-center justify-center text-fg-2 hover:text-fg hover:bg-alt transition-colors shrink-0"
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4">
        <CompareTable />
      </div>
    </>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="compare-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={close}
            aria-hidden
          />
          {isMobile ? (
            <motion.div
              key="compare-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="compare-title"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="fixed bottom-0 inset-x-0 z-50 h-[90vh] rounded-t-2xl bg-card border-t border-rim shadow-2xl flex flex-col"
            >
              <div className="w-12 h-1 rounded-full bg-rim mx-auto mt-3 shrink-0" />
              {content}
            </motion.div>
          ) : (
            <div key="compare-wrap" className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
              <motion.div
                key="compare-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="compare-title"
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="pointer-events-auto w-full max-w-5xl max-h-[85vh] rounded-2xl bg-card border border-rim shadow-2xl flex flex-col"
              >
                {content}
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  )
}
