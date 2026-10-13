'use client'

import { useSyncExternalStore } from 'react'

// Consentimiento de cookies de analíticas, guardado en el navegador.
// null = todavía no decide (se muestra el banner).

export type Consent = 'granted' | 'denied' | null

const STORAGE_KEY = 'veloire-cookie-consent'
const listeners = new Set<() => void>()

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? ''
export const GA_ENABLED = /^G-[A-Z0-9]+$/.test(GA_ID)

function readConsent(): Consent {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    return null
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback)
  window.addEventListener('storage', callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener('storage', callback)
  }
}

export function setConsent(value: Consent) {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {}
  if (GA_ENABLED) gaWindow()[`ga-disable-${GA_ID}`] = value !== 'granted'
  if (value === 'denied') clearAnalyticsCookies()
  listeners.forEach((notify) => notify())
}

function gaWindow() {
  return window as unknown as Record<string, boolean>
}

// undefined en el servidor y durante la hidratación: así el banner no aparece
// en el HTML inicial y no hay desajuste de hidratación.
export function useConsent(): Consent | undefined {
  return useSyncExternalStore(subscribe, readConsent, () => undefined)
}

// Si la clienta retira el consentimiento después de haberlo dado, Google
// Analytics ya está cargado en la página: setConsent lo apaga con su bandera
// oficial (ga-disable-ID) y acá se borran sus cookies (_ga, _ga_XXXX).
function clearAnalyticsCookies() {
  if (!GA_ENABLED) return
  const domain = window.location.hostname.replace(/^www\./, '')
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim()
    if (!name.startsWith('_ga')) continue
    document.cookie = `${name}=; Max-Age=0; path=/`
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}`
  }
}
