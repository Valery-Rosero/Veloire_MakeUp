'use client'

import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ShieldOff } from 'lucide-react'
import { revokeAdmin } from '@/app/admin/administradores/actions'
import { useConfirmAction } from '@/hooks/useConfirmAction'

interface Props {
  userId: string
  label: string
}

export function RevokeAdminButton({ userId, label }: Props) {
  const router = useRouter()
  const { showModal, isPending, error, open, close, confirm } = useConfirmAction(
    async () => {
      const result = await revokeAdmin(userId)
      if (result?.error) return { error: result.error }
    },
    () => router.refresh()
  )

  return (
    <>
      <button
        onClick={open}
        className="flex items-center gap-1.5 text-sm font-body font-medium text-error hover:underline underline-offset-2 whitespace-nowrap"
      >
        <ShieldOff size={14} />
        Revocar
      </button>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              key="revoke-bg"
              className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />
            <motion.div
              key="revoke-modal"
              className="fixed inset-0 z-101 flex items-center justify-center p-4 pointer-events-none"
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <div className="bg-card border border-rim rounded-2xl p-6 max-w-xs w-full shadow-2xl pointer-events-auto">
                <h2 className="font-display text-xl text-fg mb-1">¿Revocar acceso admin?</h2>
                <p className="font-body text-sm text-fg-2 mb-5 leading-relaxed">
                  {label} volverá a ser una cuenta de cliente normal. Puedes darle el acceso de nuevo cuando quieras.
                </p>
                {error && (
                  <p className="font-body text-xs text-error mb-3">{error}</p>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={confirm}
                    disabled={isPending}
                    className="w-full py-2.5 rounded-xl bg-error text-white text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isPending ? 'Revocando...' : 'Sí, revocar acceso'}
                  </button>
                  <button
                    onClick={close}
                    disabled={isPending}
                    className="text-sm font-body text-fg-3 hover:text-fg transition-colors py-2"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
