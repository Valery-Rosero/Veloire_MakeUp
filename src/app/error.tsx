'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-page">
      <p
        className="font-body uppercase text-accent mb-4"
        style={{ fontSize: '10px', letterSpacing: '4px' }}
      >
        Algo salió mal
      </p>

      <h1
        className="font-display italic text-fg text-center leading-[1.05] mb-4"
        style={{ fontSize: 'clamp(48px, 10vw, 80px)' }}
      >
        Error inesperado
      </h1>

      <p className="font-body text-fg-2 text-center max-w-sm leading-relaxed mb-10" style={{ fontSize: '15px' }}>
        Ocurrió un problema al cargar esta página. Puedes intentarlo de nuevo o volver al inicio.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
        >
          <RefreshCw size={14} />
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-body font-medium text-fg-2 hover:text-fg transition-colors py-3.5"
        >
          <ArrowLeft size={14} />
          Inicio
        </Link>
      </div>
    </main>
  )
}
