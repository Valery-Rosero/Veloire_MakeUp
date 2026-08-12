import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-page">
      <p
        className="font-body uppercase text-accent mb-4"
        style={{ fontSize: '10px', letterSpacing: '4px' }}
      >
        Error 404
      </p>

      <h1
        className="font-display italic text-fg text-center leading-[1.05] mb-4"
        style={{ fontSize: 'clamp(56px, 12vw, 96px)' }}
      >
        Página no encontrada
      </h1>

      <p className="font-body text-fg-2 text-center max-w-sm leading-relaxed mb-10" style={{ fontSize: '15px' }}>
        La dirección que buscas no existe o fue movida. Prueba desde el catálogo o la página de inicio.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
        >
          Ver catálogo
        </Link>
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
