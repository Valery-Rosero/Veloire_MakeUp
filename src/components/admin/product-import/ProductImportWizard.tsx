'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { WizardHeader } from './WizardHeader'
import { Step1Upload } from './Step1Upload'
import { Step2Products } from './Step2Products'
import { Step3Shades } from './Step3Shades'
import { Step4Confirm } from './Step4Confirm'
import { useProductImportStore } from '@/lib/store/product-import'
import type { Category } from '@/lib/store/product-import'

export function ProductImportWizard({ categories }: { categories: Category[] }) {
  const step = useProductImportStore((s) => s.step)
  const reset = useProductImportStore((s) => s.reset)
  const [confirming, setConfirming] = useState(false)

  return (
    <div>
      <div className="flex items-start justify-between mb-0">
        <div className="flex-1">
          <WizardHeader current={step} />
        </div>

        {/* Botón cancelar — visible solo cuando hay una importación en curso */}
        {step > 1 && (
          <button
            onClick={() => setConfirming(true)}
            className="shrink-0 flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-xl text-xs font-body text-fg-3 hover:text-error hover:bg-error/8 transition-colors"
          >
            <RotateCcw size={13} />
            Cancelar importación
          </button>
        )}
      </div>

      {step === 1 && <Step1Upload categories={categories} />}
      {step === 2 && <Step2Products categories={categories} />}
      {step === 3 && <Step3Shades />}
      {step === 4 && <Step4Confirm categories={categories} />}

      {/* Modal de confirmación */}
      <AnimatePresence>
        {confirming && (
          <>
            <motion.div
              key="cancel-bg"
              className="fixed inset-0 z-100 bg-black/55 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirming(false)}
            />
            <motion.div
              key="cancel-modal"
              className="fixed inset-0 z-101 flex items-center justify-center p-4 pointer-events-none"
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <div className="bg-card border border-rim rounded-2xl p-6 max-w-xs w-full shadow-2xl pointer-events-auto">
                <h2 className="font-display text-xl text-fg mb-1">¿Cancelar importación?</h2>
                <p className="font-body text-sm text-fg-2 leading-relaxed mb-5">
                  Se perderá todo el progreso actual y podrás empezar una nueva importación.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { reset(); setConfirming(false) }}
                    className="w-full py-2.5 rounded-xl bg-error/10 text-error text-sm font-body font-medium hover:bg-error/20 transition-colors"
                  >
                    Sí, cancelar y empezar de nuevo
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="text-sm font-body text-fg-3 hover:text-fg transition-colors py-2"
                  >
                    No, continuar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
