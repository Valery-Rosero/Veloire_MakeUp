'use client'

import { useEffect, useId } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  X, Home, LayoutGrid, Sparkles, Heart, Truck, MessageCircle, Search, ShoppingBag, User, ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { ThemeSwitch } from '@/components/ui/ThemeSwitch'
import { ACCENT_STRIPE, AVATAR_GRADIENT, LOGO_GLOW } from '@/components/ui/brand'

interface MenuItem {
  href: string
  label: string
  icon: LucideIcon
}

const SECTIONS: Array<{ title: string; items: MenuItem[] }> = [
  {
    title: 'Comprar',
    items: [
      { href: '/', label: 'Inicio', icon: Home },
      { href: '/catalogo', label: 'Catálogo', icon: LayoutGrid },
      { href: '/catalogo?orden=nuevo', label: 'Novedades', icon: Sparkles },
    ],
  },
  {
    title: 'Conócenos',
    items: [
      { href: '/nosotras', label: 'Sobre nosotras', icon: Heart },
      { href: '/envios', label: 'Envíos', icon: Truck },
      { href: '/contacto', label: 'Contacto', icon: MessageCircle },
    ],
  },
]

// "Catálogo" y "Novedades" comparten ruta: se distinguen por ?orden=nuevo.
// El menú solo se monta abierto (en el navegador), así que leer location acá
// no afecta el render del servidor.
function isActive(href: string, pathname: string) {
  const [path, query] = href.split('?')
  const search = typeof window !== 'undefined' ? window.location.search.slice(1) : ''
  if (path === '/') return pathname === '/'
  if (pathname !== path && !pathname.startsWith(path + '/')) return false
  if (path === '/catalogo') return query ? search.includes(query) : !search.includes('orden=nuevo')
  return true
}

interface Props {
  open: boolean
  onClose: () => void
  pathname: string
  itemCount: number
  onSearch: () => void
  onCart: () => void
}

// Menú de la tienda para celular y tablet, con el mismo estilo de la barra
// lateral del panel: secciones con íconos, opción activa con fondo que se
// desliza, accesos rápidos, selector de tema y "Mi cuenta".
export function StoreMenuDrawer({ open, onClose, pathname, itemCount, onSearch, onCart }: Props) {
  const uid = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  let index = 0 // para escalonar la entrada de las opciones

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-[55] backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            key="menu-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-0 left-0 bottom-0 z-[60] w-[300px] max-w-[85vw] flex flex-col bg-card rounded-r-2xl shadow-2xl overflow-hidden"
          >
            <div aria-hidden style={{ height: 2, background: ACCENT_STRIPE }} className="shrink-0" />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -left-20 w-64 h-64 rounded-full opacity-60 dark:opacity-40"
              style={{ background: LOGO_GLOW }}
            />

            {/* Logo */}
            <div className="relative flex items-start justify-between px-6 pt-6 pb-4">
              <Link href="/" onClick={onClose} className="group">
                <span className="font-display text-[26px] text-fg uppercase tracking-wide block leading-none group-hover:opacity-80 transition-opacity">
                  Vèloire
                </span>
                <span className="font-body text-[8px] uppercase tracking-[0.4em] mt-1.5 block" style={{ color: '#a56583' }}>
                  Make up
                </span>
              </Link>
              <button
                onClick={onClose}
                aria-label="Cerrar menú"
                className="p-1.5 -mr-1.5 rounded-lg text-fg-3 hover:text-fg hover:bg-highlight transition-colors"
              >
                <X size={18} strokeWidth={1.6} />
              </button>
            </div>

            {/* Accesos rápidos */}
            <div className="relative grid grid-cols-2 gap-2 px-4 pb-4">
              <button
                onClick={() => { onClose(); onSearch() }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-alt text-sm font-body text-fg-2 hover:text-accent hover:bg-highlight transition-colors"
              >
                <Search size={15} strokeWidth={1.8} />
                Buscar
              </button>
              <button
                onClick={() => { onClose(); onCart() }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-alt text-sm font-body text-fg-2 hover:text-accent hover:bg-highlight transition-colors"
              >
                <ShoppingBag size={15} strokeWidth={1.8} />
                Carrito
                {itemCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-rose-vivid text-white text-[10px] font-medium flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>

            {/* Navegación */}
            <nav className="relative flex-1 overflow-y-auto px-3 pb-4 space-y-5" aria-label="Menú principal">
              {SECTIONS.map((section) => (
                <div key={section.title}>
                  <p className="px-3.5 mb-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-fg-3">
                    {section.title}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map(({ href, label, icon: Icon }) => {
                      const active = isActive(href, pathname)
                      const delay = 0.08 + index++ * 0.04
                      return (
                        <motion.div
                          key={href}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay, duration: 0.25, ease: 'easeOut' }}
                        >
                          <Link
                            href={href}
                            onClick={onClose}
                            aria-current={active ? 'page' : undefined}
                            className={`group relative flex items-center gap-3 px-2.5 py-2 rounded-xl text-[15px] font-body transition-colors ${
                              active ? 'text-fg font-medium' : 'text-fg-2 hover:text-fg'
                            }`}
                          >
                            {active && (
                              <motion.span
                                layoutId={`${uid}-menu-active`}
                                className="absolute inset-0 rounded-xl bg-highlight"
                                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                                aria-hidden
                              >
                                <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-accent" />
                              </motion.span>
                            )}
                            <span
                              className={`relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                active
                                  ? 'bg-accent text-white shadow-sm'
                                  : 'text-fg-3 group-hover:bg-highlight group-hover:text-accent'
                              }`}
                            >
                              <Icon size={16} strokeWidth={active ? 2 : 1.6} />
                            </span>
                            <span className="relative">{label}</span>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Tema */}
            <div className="relative px-4 pt-3 pb-3 border-t border-rim">
              <ThemeSwitch label="Tema" />
            </div>

            {/* Mi cuenta */}
            <div className="relative px-4 pb-5">
              <Link
                href="/cuenta"
                onClick={onClose}
                className="group flex items-center gap-3 p-2.5 rounded-xl border border-rim bg-page hover:border-accent transition-colors"
              >
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm text-white"
                  style={{ background: AVATAR_GRADIENT }}
                >
                  <User size={16} strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-body text-sm font-medium text-fg">Mi cuenta</span>
                  <span className="block font-body text-[11px] text-fg-3">Tus pedidos y datos</span>
                </span>
                <ChevronRight size={16} className="text-fg-3 group-hover:text-accent transition-colors" />
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
