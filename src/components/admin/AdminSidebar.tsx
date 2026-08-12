'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/components/ui/ThemeProvider'
import { LayoutDashboard, ShoppingBag, Package, BarChart2, Settings, Layers, Users, History, X, LogOut, Sun, Moon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types/database'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag, exact: false },
  { href: '/admin/productos', label: 'Productos', icon: Package, exact: false },
  { href: '/admin/categorias', label: 'Categorías', icon: Layers, exact: false },
  { href: '/admin/inventario', label: 'Inventario', icon: BarChart2, exact: false },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings, exact: false },
  { href: '/admin/administradores', label: 'Administradores', icon: Users, exact: false, roles: ['superadmin'] as UserRole[] },
  { href: '/admin/historial', label: 'Historial', icon: History, exact: false, roles: ['superadmin'] as UserRole[] },
]

interface Props {
  userEmail: string
  userName: string | null
  userRole: UserRole
  onClose?: () => void
}

export function AdminSidebar({ userEmail, userName, userRole, onClose }: Props) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const navItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(userRole))

  const displayName = userName ?? 'Administradora'
  const initials = displayName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.replace('/')
  }

  return (
    <aside className="w-64 bg-card border-r border-rim flex flex-col min-h-screen">

      {/* Logo */}
      <div className="px-6 py-6 border-b border-rim">
        <div className="flex items-start justify-between">
          <div>
            <div className="w-7 h-px bg-accent mb-3" />
            <span className="font-display text-2xl text-fg uppercase tracking-widest block leading-none">
              Vèloire
            </span>
            <span className="font-body text-[10px] text-fg-3 uppercase tracking-[0.18em] mt-1.5 block">
              Panel de administración
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-fg-3 hover:text-fg hover:bg-highlight transition-colors mt-0.5"
              aria-label="Cerrar menú"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-body transition-all ${
                isActive
                  ? 'bg-highlight text-accent font-medium'
                  : 'text-fg-2 hover:bg-highlight/60 hover:text-fg'
              }`}
            >
              <Icon size={17} strokeWidth={isActive ? 2 : 1.5} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-rim px-4 py-4">
        <div className="flex items-center gap-3 mb-3.5">
          <div className="w-8 h-8 rounded-full bg-highlight flex items-center justify-center shrink-0">
            <span className="font-body text-xs font-semibold text-accent">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-body text-xs font-medium text-fg truncate">{displayName}</p>
            <p className="font-body text-[11px] text-fg-3 truncate">{userEmail}</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs font-body text-fg-2 hover:text-fg transition-colors"
          >
            <LogOut size={13} />
            Cerrar sesión
          </button>
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label="Cambiar tema"
            className="p-1.5 rounded-lg text-fg-2 hover:text-fg hover:bg-highlight transition-colors"
          >
            {resolvedTheme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </aside>
  )
}
