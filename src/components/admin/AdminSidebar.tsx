'use client'

import { useId } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { X, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ThemeSwitch } from '@/components/ui/ThemeSwitch'
import { ACCENT_STRIPE, AVATAR_GRADIENT, LOGO_GLOW } from '@/components/ui/brand'
import { navSectionsFor, isNavActive, initialsOf } from './admin-nav'
import type { UserRole } from '@/types/database'

interface Props {
  userEmail: string
  userName: string | null
  userRole: UserRole
  onClose?: () => void
}

export function AdminSidebar({ userEmail, userName, userRole, onClose }: Props) {
  const pathname = usePathname()
  // El sidebar existe dos veces (fijo en desktop y en el cajón de celular/tablet):
  // cada uno necesita su propio layoutId para que el fondo activo no salte entre ellos.
  const uid = useId()
  const sections = navSectionsFor(userRole)
  const displayName = userName ?? 'Administradora'

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.replace('/')
  }

  return (
    <aside className="relative w-64 bg-card border-r border-rim flex flex-col h-dvh sticky top-0 overflow-hidden">
      <div aria-hidden style={{ height: 2, background: ACCENT_STRIPE }} className="shrink-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-20 w-64 h-64 rounded-full opacity-60 dark:opacity-40"
        style={{ background: LOGO_GLOW }}
      />

      {/* ── Logo ── */}
      <div className="relative px-6 pt-6 pb-5">
        <div className="flex items-start justify-between">
          <Link href="/admin" onClick={onClose} className="group">
            <span className="font-display text-[26px] text-fg uppercase tracking-wide block leading-none group-hover:opacity-80 transition-opacity">
              Vèloire
            </span>
            <span className="font-body text-[8px] uppercase tracking-[0.4em] mt-1.5 block" style={{ color: '#a56583' }}>
              Make up
            </span>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 -mr-1.5 rounded-lg text-fg-3 hover:text-fg hover:bg-highlight transition-colors"
              aria-label="Cerrar menú"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5 mt-4 px-2.5 py-1 rounded-full bg-highlight text-accent text-[10px] font-body font-semibold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          {userRole === 'superadmin' ? 'Superadmin' : 'Admin'}
        </span>
      </div>

      {/* ── Navegación ── */}
      <nav className="relative flex-1 overflow-y-auto px-3 pb-4 space-y-5" aria-label="Panel de administración">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-3.5 mb-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-fg-3">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const { href, label, icon: Icon } = item
                const isActive = isNavActive(item, pathname)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    aria-current={isActive ? 'page' : undefined}
                    className={`group relative flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-body transition-colors ${
                      isActive ? 'text-fg font-medium' : 'text-fg-2 hover:text-fg'
                    }`}
                  >
                    {/* Fondo de la opción activa: se desliza al cambiar de página */}
                    {isActive && (
                      <motion.span
                        layoutId={`${uid}-nav-active`}
                        className="absolute inset-0 rounded-xl bg-highlight"
                        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                        aria-hidden
                      >
                        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-accent" />
                      </motion.span>
                    )}
                    <span
                      className={`relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-accent text-white shadow-sm'
                          : 'text-fg-3 group-hover:bg-highlight group-hover:text-accent'
                      }`}
                    >
                      <Icon size={16} strokeWidth={isActive ? 2 : 1.6} />
                    </span>
                    <span className="relative">{label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Tema ── */}
      <div className="relative px-4 pt-3 pb-3 border-t border-rim">
        <ThemeSwitch label="Tema" />
      </div>

      {/* ── Usuaria ── */}
      <div className="relative px-4 pb-4">
        <div className="flex items-center gap-3 p-2.5 rounded-xl border border-rim bg-page">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: AVATAR_GRADIENT }}
          >
            <span className="font-body text-xs font-semibold text-white">{initialsOf(displayName)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-body text-xs font-medium text-fg truncate">{displayName}</p>
            <p className="font-body text-[11px] text-fg-3 truncate">{userEmail}</p>
          </div>
          <button
            onClick={handleSignOut}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="p-2 -mr-1 rounded-lg text-fg-3 hover:text-error hover:bg-error/10 transition-colors shrink-0"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
