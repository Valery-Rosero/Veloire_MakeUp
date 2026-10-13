'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/ui/ThemeProvider'
import { ShoppingBag, Search, User, Sun, Moon, Menu } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchOverlay } from '@/components/store/SearchOverlay'
import { SHOW_HEADER_EVENT } from '@/lib/fly-to-cart'
import { StoreMenuDrawer } from '@/components/ui/StoreMenuDrawer'
import { ACCENT_STRIPE } from '@/components/ui/brand'

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
        background: ACCENT_STRIPE,
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
        className="font-display text-fg leading-none uppercase tracking-wide group-hover:opacity-80 transition-opacity duration-200"
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
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const pathname = usePathname()
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0))
  const openDrawer = useCartStore((s) => s.openDrawer)
  const prevCountRef = useRef(itemCount)
  const [badgeAnim, setBadgeAnim] = useState(0)

  useEffect(() => {
    if (itemCount > prevCountRef.current) setBadgeAnim((k) => k + 1)
    prevCountRef.current = itemCount
  }, [itemCount])

  // En móvil el header se esconde al bajar (más pantalla para los productos)
  // y vuelve apenas se sube un poco. Solo cuenta un movimiento de más de 8px
  // para no titilar con el temblor del dedo; cerca del tope siempre se ve.
  const [hidden, setHidden] = useState(false)
  const lastYRef = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 12)
      const delta = y - lastYRef.current
      if (y < 80) {
        setHidden(false)
        lastYRef.current = y
      } else if (Math.abs(delta) > 8) {
        setHidden(delta > 0)
        lastYRef.current = y
      }
    }
    // El puntito que vuela al carrito necesita el header a la vista.
    const onShow = () => setHidden(false)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener(SHOW_HEADER_EVENT, onShow)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener(SHOW_HEADER_EVENT, onShow)
    }
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
        // Si se llega al header con el teclado (Tab) estando escondido, vuelve.
        onFocus={() => setHidden(false)}
        className={`sticky top-0 z-40 transition-all duration-300 border-b ${
          hidden && !menuOpen && !searchOpen ? 'max-lg:-translate-y-full' : ''
        } ${
          scrolled
            ? 'bg-alt/92 backdrop-blur-md border-[#d9bfb0] dark:border-rim shadow-[0_4px_24px_rgba(0,0,0,0.08)]'
            : 'bg-alt border-[#e8d0c0] dark:border-rim/60'
        }`}
      >
        <AccentStripe />

        <div className="max-w-7xl mx-auto px-5 md:px-10">

          {/* ── Celular y tablet: menú · logo · íconos ── */}
          <div className="flex lg:hidden items-center h-16">
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
              <button onClick={openDrawer} aria-label="Abrir carrito" data-cart-icon className="relative w-10 h-10 flex items-center justify-center text-fg-2 hover:text-fg transition-colors">
                <ShoppingBag size={18} strokeWidth={1.5} />
                {badge}
              </button>
              <ThemeToggle />
            </div>
          </div>

          {/* ── Desktop (lg+): logo · nav centrado · íconos ── */}
          <div className="hidden lg:flex items-center py-4 relative">

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
              <button onClick={openDrawer} aria-label="Abrir carrito" data-cart-icon className={`relative ${iconClass}`}>
                <ShoppingBag size={15} strokeWidth={1.5} />
                {badge}
              </button>
              <div className="w-px h-4 bg-rim mx-1" />
              <ThemeToggle />
            </div>
          </div>

        </div>
      </header>

      {/* ── Menú de celular y tablet ── */}
      <StoreMenuDrawer
        open={menuOpen}
        onClose={closeMenu}
        pathname={pathname}
        itemCount={itemCount}
        onSearch={() => setSearchOpen(true)}
        onCart={openDrawer}
      />
    </>
  )
}
