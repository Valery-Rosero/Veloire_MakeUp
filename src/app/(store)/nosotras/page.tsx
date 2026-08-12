import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Heart, Sparkles, MapPin } from 'lucide-react'

const LERY_IG = 'https://www.instagram.com/leery.me?igsh=Njhodmxpa3FocHNw'

export const metadata: Metadata = {
  title: 'Sobre nosotras — Vèloire MakeUp',
  description: 'Conoce la historia detrás de Vèloire: maquillaje para personas creativas, desde Pasto, Nariño.',
}

const VALUES = [
  {
    icon: Heart,
    title: 'Hecho con amor',
    body: 'Cada producto es seleccionado con cuidado. No vendemos maquillaje al azar — vendemos lo que yo misma usaría y recomendaría sin dudar.',
  },
  {
    icon: Sparkles,
    title: 'Para quien crea',
    body: 'El maquillaje es arte. Vèloire existe para quienes lo usan como herramienta de expresión — no para seguir tendencias, sino para inventar las propias.',
  },
  {
    icon: MapPin,
    title: 'Orgullo pastuso',
    body: 'Nació en Pasto, crece en Pasto. Cada pedido lo entrego yo, y eso significa que detrás de cada caja hay una persona real que sabe tu nombre.',
  },
]

export default function NosotrasPage() {
  return (
    <main>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-alt border-b border-rim py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 text-center">

          <p
            className="font-body uppercase text-accent mb-5"
            style={{ fontSize: '10px', letterSpacing: '4px' }}
          >
            Detrás de Vèloire
          </p>

          <h1 className="font-display text-[52px] md:text-[72px] text-fg leading-[1.04] tracking-tight mb-6">
            Hola,{' '}
            <em className="text-accent" style={{ fontStyle: 'italic' }}>soy Lery</em>
          </h1>

          <p className="font-body text-base md:text-lg text-fg-2 leading-[1.75] max-w-xl mx-auto">
            Valery Rosero. Emprendedora, amante del maquillaje y la única persona
            detrás de todo lo que ves en esta tienda.
          </p>

        </div>
      </section>

      {/* ── Historia ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-page">
        <div className="max-w-3xl mx-auto px-4">

          <div className="flex items-center gap-3 mb-10">
            <div className="w-px h-8 bg-accent shrink-0" />
            <h2 className="font-display text-2xl md:text-3xl text-fg">La historia</h2>
          </div>

          <div className="space-y-6 font-body text-[15px] text-fg-2 leading-[1.85]">
            <p>
              Pasto es una ciudad que crea. Lo veo en la gente, en las calles,
              en cómo se visten y en cómo se presentan al mundo. La creatividad
              acá no es un lujo — es una forma de ser. Y sentí que el maquillaje
              disponible no estaba hablándole a esa energía.
            </p>
            <p>
              Así que decidí construir algo para quienes ven el maquillaje como lo
              que realmente es: una herramienta de expresión. Empecé investigando,
              probando, fallando y volviendo a intentarlo, hasta armar una colección
              que le habla a quienes crean. Y con eso nació{' '}
              <span className="font-medium text-fg">Vèloire</span> —{' '}
              que en francés evoca algo que se revela, algo que brilla cuando
              lo dejas salir.
            </p>
            <p>
              No tengo un equipo de veinte personas ni una bodega llena de cajas.
              Tengo dedicación, mucho café y las ganas genuinas de que cada persona
              en Pasto encuentre lo que necesita para crear lo que imagina.
              Soy <span className="font-medium text-fg">This is Lery</span>, y esta
              es mi tienda.
            </p>
          </div>

          {/* Firma */}
          <div className="mt-12 flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#f9edf2' }}
            >
              <span className="font-display text-lg text-accent">V</span>
            </div>
            <div>
              <p className="font-display text-base text-fg leading-tight">Valery Rosero</p>
              <p className="font-body text-xs text-fg-3 mt-0.5" style={{ letterSpacing: '1px' }}>
                Fundadora · Vèloire MakeUp
              </p>
              <a
                href={LERY_IG}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-1.5 font-body text-xs text-accent hover:underline underline-offset-4 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4.5" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                </svg>
                @leery.me
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ── Valores ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-alt border-y border-rim">
        <div className="max-w-5xl mx-auto px-4">

          <div className="flex items-center gap-3 mb-12">
            <div className="w-px h-8 bg-accent shrink-0" />
            <h2 className="font-display text-2xl md:text-3xl text-fg">En qué creo</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-card border border-rim rounded-2xl p-7 flex flex-col gap-4"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#f9edf2' }}
                >
                  <Icon size={18} className="text-accent" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl text-fg leading-snug">{title}</h3>
                <p className="font-body text-sm text-fg-2 leading-[1.7]">{body}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-page">
        <div className="max-w-xl mx-auto px-4 text-center">

          <p className="font-display text-2xl md:text-3xl text-fg mb-4 leading-snug">
            El maquillaje que te hace<br />
            sentir <em className="text-accent" style={{ fontStyle: 'italic' }}>tú</em>
          </p>

          <p className="font-body text-sm text-fg-2 mb-8 leading-[1.7]">
            Explora la colección y encuentra tu tono. Si tienes dudas,
            escríbeme — respondo yo misma.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
            >
              Ver colección
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center text-sm font-body font-medium text-fg-2 hover:text-fg transition-colors duration-150 py-3.5"
            >
              Escribirme
            </Link>
          </div>

        </div>
      </section>

    </main>
  )
}
