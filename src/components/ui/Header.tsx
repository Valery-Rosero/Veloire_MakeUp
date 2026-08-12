'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/ui/ThemeProvider'
import { ShoppingBag, Search, User, Sun, Moon, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchOverlay } from '@/components/store/SearchOverlay'

const NAV_LINKS = [
  { label: 'Catálogo',       href: '/catalogo' },
  { label: 'Novedades',      href: '/catalogo?orden=nuevo' },
  { label: 'Sobre nosotras', href: '/nosotras' },
  { label: 'Contacto',       href: '/contacto' },
]

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="Cambiar tema"
      className="w-9 h-9 flex items-center justify-center text-fg-2 hover:text-fg transition-colors duration-200"
    >
      <Moon size={15} className="dark:hidden" strokeWidth={1.5} />
      <Sun size={15} className="hidden dark:block" strokeWidth={1.5} />
    </button>
  )
}

function isNavActive(href: string, pathname: string): boolean {
  const [path] = href.split('?')
  if (path === '/') return pathname === '/'
  return pathname === path || pathname.startsWith(path + '/')
}

function AccentStripe() {
  return (
    <div
      aria-hidden
      style={{
        height: '2px',
        background:
          'linear-gradient(90deg, transparent 0%, #8B2252 8%, #ed4a89 28%, #a56583 52%, #c08fa2 72%, transparent 100%)',
      }}
    />
  )
}

function Logo({ size = 'md', onClick }: { size?: 'sm' | 'md' | 'lg'; onClick?: () => void }) {
  const sizes = { sm: 24, md: 30, lg: 38 }
  const sub = { sm: 6.5, md: 7.5, lg: 8.5 }
  return (
    <Link href="/" onClick={onClick} className="flex flex-col items-start leading-none group">
      <span
        className="font-display italic text-fg leading-none uppercase tracking-wide group-hover:opacity-80 transition-opacity duration-200"
        style={{ fontSize: sizes[size], letterSpacing: '1px' }}
      >
        Vèloire
      </span>
      <span
        className="font-body uppercase leading-none mt-1"
        style={{ fontSize: sub[size], letterSpacing: '4px', color: '#a56583' }}
      >
        MAKE UP
      </span>
    </Link>
  )
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0))
  const openDrawer = useCartStore((s) => s.openDrawer)
  const prevCountRef = useRef(itemCount)
  const [badgeAnim, setBadgeAnim] = useState(0)

  useEffect(() => {
    if (itemCount > prevCountRef.current) setBadgeAnim((k) => k + 1)
    prevCountRef.current = itemCount
  }, [itemCount])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Bloquear scroll del body cuando el menú está abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const badge = (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.span
          key={badgeAnim}
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.4, 1] }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.3, times: [0, 0.6, 1] }}
          className="absolute -top-0.5 -right-0.5 bg-rose-vivid text-white flex items-center justify-center rounded-full font-body font-medium pointer-events-none"
          style={{ width: '15px', height: '15px', fontSize: '9px' }}
        >
          {itemCount}
        </motion.span>
      )}
    </AnimatePresence>
  )

  const iconClass = "w-9 h-9 flex items-center justify-center text-fg-2 hover:text-fg transition-colors duration-200"

  return (
    <>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <header
        className={`sticky top-0 z-40 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-alt/92 backdrop-blur-md border-[#d9bfb0] dark:border-rim shadow-[0_4px_24px_rgba(0,0,0,0.08)]'
            : 'bg-alt border-[#e8d0c0] dark:border-rim/60'
        }`}
      >
        <AccentStripe />

        <div className="max-w-7xl mx-auto px-5 md:px-10">

          {/* ── Mobile: hamburger · logo · íconos ── */}
          <div className="flex md:hidden items-center h-16">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              className="w-10 h-10 flex items-center justify-center text-fg-2 hover:text-fg transition-colors shrink-0 -ml-1"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>

            <div className="flex-1 flex justify-center">
              <Logo size="sm" />
            </div>

            <div className="flex items-center gap-0.5 -mr-1">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Buscar"
                className="w-10 h-10 flex items-center justify-center text-fg-2 hover:text-fg transition-colors"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>
              <button onClick={openDrawer} aria-label="Abrir carrito" className="relative w-10 h-10 flex items-center justify-center text-fg-2 hover:text-fg transition-colors">
                <ShoppingBag size={18} strokeWidth={1.5} />
                {badge}
              </button>
              <ThemeToggle />
            </div>
          </div>

          {/* ── Desktop: logo · nav centrado · íconos ── */}
          <div className="hidden md:flex items-center py-4 relative">

            {/* Logo izquierda — más grande */}
            <Logo size="lg" />

            {/* Nav centrado con separadores · */}
            <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
              {NAV_LINKS.map((link, i) => {
                const active = isNavActive(link.href, pathname)
                return (
                  <div key={link.href} className="flex items-center">
                    {i > 0 && (
                      <span className="mx-3 text-fg-3 select-none" style={{ fontSize: '10px' }}>·</span>
                    )}
                    <Link
                      href={link.href}
                      className={`relative group font-body uppercase transition-colors duration-200 py-1 ${
                        active ? 'text-fg' : 'text-fg-2 hover:text-fg'
                      }`}
                      style={{ fontSize: '11px', letterSpacing: '2px' }}
                    >
                      {link.label}
                      <span
                        className={`absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-300 ease-out ${
                          active ? 'w-full' : 'w-0 group-hover:w-full'
                        }`}
                      />
                    </Link>
                  </div>
                )
              })}
            </nav>

            {/* Íconos derecha */}
            <div className="ml-auto flex items-center gap-1">
              <button aria-label="Buscar" className={iconClass} onClick={() => setSearchOpen(true)}>
                <Search size={15} strokeWidth={1.5} />
              </button>
              <Link href="/cuenta" aria-label="Mi cuenta" className={iconClass}>
                <User size={15} strokeWidth={1.5} />
              </Link>
              <button onClick={openDrawer} aria-label="Abrir carrito" className={`relative ${iconClass}`}>
                <ShoppingBag size={15} strokeWidth={1.5} />
                {badge}
              </button>
              <div className="w-px h-4 bg-rim mx-1" />
              <ThemeToggle />
            </div>
          </div>

        </div>
      </header>

      {/* ── Drawer móvil — desliza desde la izquierda ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />

            {/* Panel lateral */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.32, 0, 0.67, 0] }}
              className="fixed top-0 left-0 bottom-0 w-72 z-50 flex flex-col"
              style={{ backgroundColor: 'var(--bg-alt, #fdf6f0)' }}
            >
              <AccentStripe />

              {/* Cabecera */}
              <div className="flex items-center justify-between px-6 py-5">
                <Logo size="sm" onClick={() => setMenuOpen(false)} />
                <button
                  onClick={() => setMenuOpen(false)}
                  aria-label="Cerrar menú"
                  className="w-9 h-9 flex items-center justify-center text-fg-2 hover:text-fg transition-colors rounded-full hover:bg-highlight"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              {/* Divisor */}
              <div className="mx-6 border-t border-[#e8d0c0] dark:border-rim" />

              {/* Links */}
              <nav className="flex flex-col px-4 pt-4 flex-1">
                {NAV_LINKS.map((link, i) => {
                  const active = isNavActive(link.href, pathname)
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.06, duration: 0.25, ease: 'easeOut' }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3.5 rounded-xl font-display italic text-[20px] transition-colors duration-150 ${
                          active
                            ? 'text-accent bg-highlight'
                            : 'text-fg hover:text-accent hover:bg-highlight/60'
                        }`}
                      >
                        {active && (
                          <span className="w-1 h-4 rounded-full bg-accent shrink-0" />
                        )}
                        {link.label}
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>

              {/* Pie */}
              <div className="px-4 pb-8 pt-4 border-t border-[#e8d0c0] dark:border-rim mx-2">
                <Link
                  href="/cuenta"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-body text-fg-2 hover:text-fg hover:bg-highlight transition-colors"
                >
                  <User size={15} strokeWidth={1.5} />
                  <span>Mi cuenta</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
