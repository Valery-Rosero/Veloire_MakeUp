import {
  LayoutDashboard, ShoppingBag, Package, BarChart2, Settings, Layers, Users, History, type LucideIcon,
} from 'lucide-react'
import type { UserRole } from '@/types/database'

// Menú del panel en un solo lugar: lo usan la barra lateral (desktop y cajón),
// el riel de íconos (tablet) y la barra superior (celular, para el título).

export interface AdminNavItem {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
  roles?: UserRole[]
}

export const ADMIN_NAV_SECTIONS: Array<{ title: string; items: AdminNavItem[] }> = [
  {
    title: 'General',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
    ],
  },
  {
    title: 'Catálogo',
    items: [
      { href: '/admin/productos', label: 'Productos', icon: Package },
      { href: '/admin/categorias', label: 'Categorías', icon: Layers },
      { href: '/admin/inventario', label: 'Inventario', icon: BarChart2 },
    ],
  },
  {
    title: 'Ajustes',
    items: [
      { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
      { href: '/admin/administradores', label: 'Administradores', icon: Users, roles: ['superadmin'] },
      { href: '/admin/historial', label: 'Historial', icon: History, roles: ['superadmin'] },
    ],
  },
]

/** Secciones con solo las opciones que ese rol puede ver. */
export function navSectionsFor(role: UserRole) {
  return ADMIN_NAV_SECTIONS.map((s) => ({
    ...s,
    items: s.items.filter((item) => !item.roles || item.roles.includes(role)),
  })).filter((s) => s.items.length > 0)
}

export function isNavActive(item: AdminNavItem, pathname: string) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href)
}

/** Nombre de la sección actual (para la barra superior en celular). */
export function sectionTitle(pathname: string) {
  for (const section of ADMIN_NAV_SECTIONS) {
    const item = section.items.find((i) => isNavActive(i, pathname))
    if (item) return item.label
  }
  return 'Panel'
}

export function initialsOf(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}
