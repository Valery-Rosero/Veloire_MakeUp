'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AdminSidebar } from './AdminSidebar'
import { AdminMobileHeader } from './AdminMobileHeader'
import { createClient } from '@/lib/supabase/client'

interface Props {
  children: React.ReactNode
  userEmail: string
  userName: string | null
  userRole: 'admin' | 'superadmin'
}

export function AdminLayoutShell({ children, userEmail, userName, userRole }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)

  // Interceptar el botón atrás cuando el usuario sale del admin.
  // Si el usuario presionó atrás varias veces y quedó a múltiples pasos de /admin,
  // el flag isReturningToAdmin mantiene el loop "go(1) hasta estar en admin".
  useEffect(() => {
    let isReturningToAdmin = false

    function handlePopState() {
      const inAdmin = window.location.pathname.startsWith('/admin')

      if (isReturningToAdmin) {
        if (inAdmin) {
          isReturningToAdmin = false   // llegamos — parar el loop
        } else {
          window.history.go(1)         // aún fuera de admin — seguir avanzando
        }
        return
      }

      if (!inAdmin) {
        isReturningToAdmin = true
        setDrawerOpen(false)           // cerrar el drawer si estaba abierto
        window.history.go(1)
        setShowLeaveModal(true)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  async function handleSignOut() {
    setShowLeaveModal(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  function handleGoToStore() {
    setShowLeaveModal(false)
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex bg-alt">
      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:block shrink-0">
        <AdminSidebar userEmail={userEmail} userName={userName} userRole={userRole} />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="overlay"
              className="lg:hidden fixed inset-0 z-50 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              key="drawer"
              className="lg:hidden fixed left-0 top-0 bottom-0 z-[60]"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
            >
              <AdminSidebar
                userEmail={userEmail}
                userName={userName}
                userRole={userRole}
                onClose={() => setDrawerOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden">
          <AdminMobileHeader onMenuClick={() => setDrawerOpen(true)} />
        </div>
        <main className="flex-1 p-5 lg:p-10">{children}</main>
      </div>

      {/* Modal — salir del admin */}
      <AnimatePresence>
        {showLeaveModal && (
          <>
            <motion.div
              key="modal-bg"
              className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeaveModal(false)}
            />
            <motion.div
              key="modal"
              className="fixed inset-0 z-101 flex items-center justify-center p-4 pointer-events-none"
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <div className="bg-card border border-rim rounded-2xl p-6 max-w-xs w-full shadow-2xl pointer-events-auto">
                <h2 className="font-display text-xl text-fg mb-1">¿Salir del admin?</h2>
                <p className="font-body text-sm text-fg-2 mb-5 leading-relaxed">
                  Parece que intentas salir del panel. ¿Qué deseas hacer?
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleGoToStore}
                    className="w-full py-2.5 rounded-xl bg-highlight text-accent text-sm font-body font-medium hover:bg-accent/15 transition-colors"
                  >
                    Ver la tienda
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full py-2.5 rounded-xl bg-error/10 text-error text-sm font-body font-medium hover:bg-error/20 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                  <button
                    onClick={() => setShowLeaveModal(false)}
                    className="text-sm font-body text-fg-3 hover:text-fg transition-colors py-2"
                  >
                    Quedarme en el admin
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
