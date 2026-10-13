'use client'

import { useId } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { PanelLeftOpen, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/ui/ThemeProvider'
import { ACCENT_STRIPE, AVATAR_GRADIENT } from '@/components/ui/brand'
import { navSectionsFor, isNavActive, initialsOf } from './admin-nav'
import type { UserRole } from '@/types/database'

interface Props {
  userName: string | null
  userRole: UserRole
  onExpand: () => void
}

// Tablet (md–lg): riel fijo de íconos con el mismo estilo del sidebar. El
// nombre de cada sección aparece al lado al pasar el mouse o con el foco del
// teclado. El botón de arriba (y el avatar) abren el menú completo.
export function AdminRail({ userName, userRole, onExpand }: Props) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const uid = useId()
  const sections = navSectionsFor(userRole)
  const isDark = resolvedTheme === 'dark'

  return (
    <aside className="relative w-[76px] bg-card border-r border-rim flex flex-col items-center h-dvh sticky top-0">
      <div aria-hidden style={{ height: 2, background: ACCENT_STRIPE }} className="w-full shrink-0" />

      <Link href="/admin" aria-label="Vèloire — Dashboard" className="mt-5 font-display text-[22px] text-fg leading-none">
        Vè
      </Link>
      <button
        onClick={onExpand}
        aria-label="Abrir menú completo"
        title="Abrir menú completo"
        className="mt-4 w-10 h-10 rounded-xl flex items-center justify-center text-fg-3 hover:text-accent hover:bg-highlight transition-colors"
      >
        <PanelLeftOpen size={18} strokeWidth={1.6} />
      </button>

      <nav className="flex-1 w-full flex flex-col items-center gap-1 pt-3" aria-label="Panel de administración">
        {sections.map((section, si) => (
          <div key={section.title} className="w-full flex flex-col items-center gap-1">
            {si > 0 && <span aria-hidden className="w-6 h-px bg-rim my-2" />}
            {section.items.map((item) => {
              const { href, label, icon: Icon } = item
              const isActive = isNavActive(item, pathname)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  aria-current={isActive ? 'page' : undefined}
                  className="group relative w-12 h-11 flex items-center justify-center rounded-xl"
                >
                  {isActive && (
                    <motion.span
                      layoutId={`${uid}-rail-active`}
                      className="absolute inset-0 rounded-xl bg-highlight"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                      aria-hidden
                    >
                      <span className="absolute -left-3 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-accent" />
                    </motion.span>
                  )}
                  <span
                    className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive ? 'bg-accent text-white shadow-sm' : 'text-fg-3 group-hover:bg-highlight group-hover:text-accent'
                    }`}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2 : 1.6} />
                  </span>
                  {/* Nombre al lado */}
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-fg text-card text-xs font-body whitespace-nowrap shadow-md opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition-all duration-150 z-50"
                  >
                    {label}
                  </span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="w-full flex flex-col items-center gap-2 pb-4 pt-3 border-t border-rim">
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={isDark ? 'Modo claro' : 'Modo oscuro'}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-alt text-accent hover:bg-highlight transition-colors"
        >
          {isDark ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
        </button>
        <button
          onClick={onExpand}
          aria-label="Mi cuenta y más opciones"
          title={userName ?? 'Mi cuenta'}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
          style={{ background: AVATAR_GRADIENT }}
        >
          <span className="font-body text-xs font-semibold text-white">{initialsOf(userName ?? 'Administradora')}</span>
        </button>
      </div>
    </aside>
  )
}
