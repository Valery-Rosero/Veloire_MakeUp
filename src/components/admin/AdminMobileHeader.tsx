'use client'

import { usePathname } from 'next/navigation'
import { Menu, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/ui/ThemeProvider'
import { ACCENT_STRIPE, AVATAR_GRADIENT } from '@/components/ui/brand'
import { sectionTitle, initialsOf } from './admin-nav'

interface Props {
  onMenuClick: () => void
  userName: string | null
}

// Celular: barra superior con el mismo estilo del sidebar. El título sale del
// menú compartido (admin-nav), así que nunca queda desactualizado.
export function AdminMobileHeader({ onMenuClick, userName }: Props) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const btn = 'w-10 h-10 rounded-xl flex items-center justify-center transition-colors'

  return (
    <header className="sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-rim">
      <div aria-hidden style={{ height: 2, background: ACCENT_STRIPE }} />
      <div className="relative h-14 px-3 flex items-center justify-between">
        <button onClick={onMenuClick} aria-label="Abrir menú" className={`${btn} text-fg-2 hover:text-accent hover:bg-highlight`}>
          <Menu size={20} strokeWidth={1.6} />
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <span className="block font-body text-[8px] uppercase tracking-[0.4em] leading-none" style={{ color: '#a56583' }}>
            Vèloire
          </span>
          <span className="block font-display text-lg text-fg leading-tight mt-0.5">{sectionTitle(pathname)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className={`${btn} bg-alt text-accent hover:bg-highlight`}
          >
            {isDark ? <Sun size={17} strokeWidth={1.8} /> : <Moon size={17} strokeWidth={1.8} />}
          </button>
          <button
            onClick={onMenuClick}
            aria-label="Mi cuenta y menú"
            className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
            style={{ background: AVATAR_GRADIENT }}
          >
            <span className="font-body text-[11px] font-semibold text-white">{initialsOf(userName ?? 'Administradora')}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
