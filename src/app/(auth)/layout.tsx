import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* ─ Columna decorativa (solo desktop) ─ */}
      <div className="hidden md:flex md:w-[40%] flex-col items-center justify-center relative overflow-hidden p-12 bg-[#D4537E]">
        {/* Círculos decorativos de textura */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-nude/25 pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full bg-nude/75 pointer-events-none" />
        <div className="absolute top-1/3 -right-8 w-40 h-40 rounded-full bg-nude/50 pointer-events-none" />

        {/* Contenido */}
        <div className="relative z-10 text-center">
          <h1 className="font-display text-6xl text-nude mb-4 leading-tight">VÈLOIRE</h1>
          <p className="font-body text-sm text-nude leading-relaxed max-w-56">
            Maquillaje hecho para ti, pensado en Pasto.
          </p>
        </div>
      </div>

      {/* ─ Columna del formulario ─ */}
      <div className="flex-1 flex flex-col bg-page min-h-screen">
        {/* Volver a la tienda */}
        <div className="px-6 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-body text-fg-2 hover:text-fg transition-colors"
          >
            <ArrowLeft size={13} />
            Volver a la tienda
          </Link>
        </div>

        {/* Contenido centrado */}
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="w-full max-w-100">{children}</div>
        </div>
      </div>
    </div>
  )
}
