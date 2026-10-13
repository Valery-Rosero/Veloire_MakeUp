'use client'

import Link from 'next/link'
import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { GA_ENABLED, GA_ID, setConsent, useConsent } from '@/lib/consent'

// Banner de cookies + Google Analytics. Analytics solo se carga si la clienta
// acepta y si NEXT_PUBLIC_GA_ID está configurado. Nada de esto corre en /admin.
export function CookieConsent() {
  const pathname = usePathname()
  const consent = useConsent()

  if (pathname.startsWith('/admin')) return null

  return (
    <>
      {consent === null && <CookieBanner />}
      {consent === 'granted' && GA_ENABLED && <GoogleAnalytics />}
    </>
  )
}

function CookieBanner() {
  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Preferencias de cookies"
      className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-xl rounded-2xl border border-rim bg-card p-5 shadow-2xl"
    >
      <p className="font-body text-sm text-fg-2 leading-relaxed">
        Usamos cookies necesarias para que la tienda funcione (tu sesión y tu carrito) y, si lo
        aceptas, cookies de analíticas para entender cómo se usa y mejorarla.{' '}
        <Link href="/privacidad" className="text-accent underline-offset-4 hover:underline">
          Política de privacidad
        </Link>
      </p>
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => setConsent('denied')}
          className="rounded-xl border border-rim px-5 py-2.5 font-body text-sm text-fg-2 transition-colors hover:border-rim-2 hover:text-fg"
        >
          Rechazar analíticas
        </button>
        <button
          type="button"
          onClick={() => setConsent('granted')}
          className="rounded-xl bg-noir px-5 py-2.5 font-body text-sm font-medium text-beige transition-opacity hover:opacity-90"
        >
          Aceptar todas
        </button>
      </div>
    </div>
  )
}

// GA4 registra solo los cambios de página dentro de la tienda (medición
// mejorada, activa por defecto), así que basta con cargarlo una vez.
function GoogleAnalytics() {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window['ga-disable-${GA_ID}']=false;window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
      </Script>
    </>
  )
}

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => setConsent(null)} className={className}>
      Configurar cookies
    </button>
  )
}
