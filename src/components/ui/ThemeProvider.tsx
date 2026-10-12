'use client'

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (t: Theme) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeCtx = createContext<ThemeValue>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeCtx)
}

// ─── Store externo (localStorage + preferencia del sistema) ───────────────────

const STORAGE_KEY = 'theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

function readStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme !== 'system') return theme
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

// localStorage no emite eventos para cambios hechos en la misma pestaña, así
// que setTheme() avisa a mano a los suscriptores de useSyncExternalStore.
const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  const mq = window.matchMedia(DARK_QUERY)
  mq.addEventListener('change', callback)
  return () => {
    listeners.delete(callback)
    mq.removeEventListener('change', callback)
  }
}

const getTheme = () => readStoredTheme()
const getResolvedTheme = () => resolveTheme(readStoredTheme())
const getServerTheme = (): Theme => 'system'
const getServerResolvedTheme = (): ResolvedTheme => 'light'

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme)
  const resolvedTheme = useSyncExternalStore(subscribe, getResolvedTheme, getServerResolvedTheme)

  // La clase inicial de <html> la pone el script inline de layout.tsx antes de
  // hidratar (sin parpadeo); acá solo se sigue la preferencia del sistema
  // mientras el tema elegido sea 'system'.
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia(DARK_QUERY)
    const handler = () => applyTheme(mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem(STORAGE_KEY, t)
    applyTheme(resolveTheme(t))
    listeners.forEach((notify) => notify())
  }, [])

  return (
    <ThemeCtx.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeCtx.Provider>
  )
}
