import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MaskLine, Reveal } from '@/components/ui/Reveal'

// Los mismos colores del hero, flotando detrás del texto (clase .float-y en
// globals.css: CSS puro, se apaga con "reducir movimiento"). Van tenues y
// pegados a los bordes para no tapar el mensaje.
const CIRCLES = [
  { color: '#8B2252', size: 220, top: '-8%',  left: '-12%', opacity: 0.16, dur: 4.0, delay: 0.2, float: -16 },
  { color: '#ed4a89', size: 150, top: '70%',  left: '-6%',  opacity: 0.22, dur: 3.6, delay: 0.0, float: -14 },
  { color: '#c08fa2', size: 260, top: '55%',  left: '82%',  opacity: 0.2,  dur: 4.2, delay: 0.5, float: -12 },
  { color: '#D4A76A', size: 90,  top: '8%',   left: '84%',  opacity: 0.3,  dur: 3.8, delay: 0.8, float: -10 },
  { color: '#a56583', size: 60,  top: '16%',  left: '10%',  opacity: 0.25, dur: 3.5, delay: 0.4, float: -8 },
  { color: '#f5b8cc', size: 70,  top: '84%',  left: '64%',  opacity: 0.4,  dur: 4.1, delay: 0.7, float: -10 },
] as const

export default function NotFound() {
  return (
    <main className="relative overflow-hidden min-h-svh flex flex-col items-center justify-center px-4 py-16 bg-page">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {CIRCLES.map((c, i) => (
          <span
            key={i}
            className="float-y absolute rounded-full"
            style={{
              // En celular se achican (~16 % del ancho por cada 100px) para no tapar el título.
              width: `min(${c.size}px, ${c.size * 0.16}vw)`,
              height: `min(${c.size}px, ${c.size * 0.16}vw)`,
              top: c.top,
              left: c.left,
              backgroundColor: c.color,
              opacity: c.opacity,
              ['--dur' as string]: `${c.dur}s`,
              ['--delay' as string]: `${c.delay}s`,
              ['--float' as string]: `${c.float}px`,
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center">
        <Reveal
          variant="fade"
          as="p"
          className="font-body uppercase text-accent mb-4"
          style={{ fontSize: '10px', letterSpacing: '4px' }}
        >
          Error 404
        </Reveal>

        <h1
          className="font-display italic text-fg text-center leading-[1.05] mb-4"
          style={{ fontSize: 'clamp(56px, 12vw, 96px)' }}
        >
          <MaskLine delay={0.1}>Página no</MaskLine>
          <MaskLine delay={0.22}>encontrada</MaskLine>
        </h1>

        <Reveal delay={0.45} as="p" className="font-body text-fg-2 text-center max-w-sm leading-relaxed mb-10" style={{ fontSize: '15px' }}>
          La dirección que buscas no existe o fue movida. Prueba desde el catálogo o la página de inicio.
        </Reveal>

        <Reveal delay={0.55} className="flex flex-col sm:flex-row items-center gap-3">
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
        </Reveal>
      </div>
    </main>
  )
}
