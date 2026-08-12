import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Mail, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contacto — Vèloire MakeUp',
  description: 'Escríbenos por WhatsApp o email. Atención personalizada desde Pasto, Nariño.',
}

async function getContactConfig(): Promise<{ whatsapp: string; instagram: string | null; email: string }> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('store_config')
      .select('key, value')
      .in('key', ['whatsapp_number', 'instagram_url', 'store_email'])
    const map = Object.fromEntries((data ?? []).map(({ key, value }) => [key, value]))
    return {
      whatsapp: (map.whatsapp_number || '573155924590').replace(/\D/g, ''),
      instagram: map.instagram_url || 'https://www.instagram.com/veloire.v?igsh=eTRjY3N5N3U1NDhi',
      email: map.store_email || 'veloirev.f@gmail.com',
    }
  } catch {
    return { whatsapp: '573155924590', instagram: null, email: 'veloirev.f@gmail.com' }
  }
}

const FAQS = [
  {
    q: '¿Cuánto tarda en llegar mi pedido?',
    a: 'Entregamos en 1 a 2 días hábiles dentro de Pasto. Una vez confirmado tu pago, te avisamos cuando tu pedido va en camino.',
  },
  {
    q: '¿Cómo sé que mi tono es el correcto?',
    a: 'Escríbeme por WhatsApp con una foto o describiendo tu tono de piel. Te ayudo a elegir el tono ideal antes de que hagas tu pedido.',
  },
  {
    q: '¿Puedo cambiar o devolver un producto?',
    a: 'Sí, si el producto llegó en mal estado o hay un error en tu pedido. Escríbeme dentro de las 24 horas siguientes a la entrega con una foto y lo resolvemos.',
  },
  {
    q: '¿Hacen envíos fuera de Pasto?',
    a: 'Por ahora solo hacemos domicilios dentro de Pasto, Nariño. Estamos trabajando para expandir la cobertura próximamente.',
  },
  {
    q: '¿Cómo pago mi pedido?',
    a: 'Aceptamos Nequi, Bancolombia y efectivo. Al finalizar tu pedido te damos las instrucciones de pago y confirmamos una vez lo recibamos.',
  },
]

export default async function ContactoPage() {
  const { whatsapp, instagram, email } = await getContactConfig()
  const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola Lery, quiero hacer una consulta sobre Vèloire 💄')}`

  return (
    <main>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <section className="bg-alt border-b border-rim py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p
            className="font-body uppercase text-accent mb-4"
            style={{ fontSize: '10px', letterSpacing: '4px' }}
          >
            Estoy aquí para ayudarte
          </p>
          <h1 className="font-display text-[44px] md:text-[60px] text-fg leading-[1.06] tracking-tight mb-5">
            Hablemos
          </h1>
          <p className="font-body text-base text-fg-2 leading-[1.7] max-w-md mx-auto">
            Respondo yo misma. Si tienes una duda sobre un tono, un pedido
            o lo que sea — escríbeme.
          </p>
        </div>
      </section>

      {/* ── Canales de contacto ────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-page">
        <div className="max-w-3xl mx-auto px-4">

          <div className="flex items-center gap-3 mb-10">
            <div className="w-px h-8 bg-accent shrink-0" />
            <h2 className="font-display text-2xl text-fg">Cómo contactarme</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* WhatsApp — canal principal */}
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card border border-rim rounded-2xl p-7 flex flex-col gap-4 hover:border-rim-2 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#f0f9f0' }}
                >
                  {/* WhatsApp icon */}
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" style={{ color: '#25D366' }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <span
                  className="font-body text-[10px] uppercase tracking-widest px-2 py-1 rounded-full"
                  style={{ backgroundColor: '#f9edf2', color: '#a56583' }}
                >
                  Recomendado
                </span>
              </div>

              <div>
                <h3 className="font-display text-xl text-fg mb-1">WhatsApp</h3>
                <p className="font-body text-sm text-fg-2 leading-[1.65]">
                  La forma más rápida de hablar conmigo. Respondo en el menor tiempo posible.
                </p>
              </div>

              <span className="font-body text-sm font-medium text-accent group-hover:underline underline-offset-4 transition-all">
                Abrir chat →
              </span>
            </a>

            {/* Email */}
            <a
              href={`mailto:${email}`}
              className="group bg-card border border-rim rounded-2xl p-7 flex flex-col gap-4 hover:border-rim-2 hover:shadow-sm transition-all duration-200"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#f9edf2' }}
              >
                <Mail size={20} className="text-accent" strokeWidth={1.5} />
              </div>

              <div>
                <h3 className="font-display text-xl text-fg mb-1">Correo electrónico</h3>
                <p className="font-body text-sm text-fg-2 leading-[1.65]">
                  Para consultas formales, colaboraciones o cualquier tema que prefieras por escrito.
                </p>
              </div>

              <span className="font-body text-sm font-medium text-accent group-hover:underline underline-offset-4 transition-all">
                {email}
              </span>
            </a>

            {/* Instagram */}
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-card border border-rim rounded-2xl p-7 flex flex-col gap-4 hover:border-rim-2 hover:shadow-sm transition-all duration-200"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#fdf0f7' }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-accent">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4.5" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                  </svg>
                </div>

                <div>
                  <h3 className="font-display text-xl text-fg mb-1">Instagram</h3>
                  <p className="font-body text-sm text-fg-2 leading-[1.65]">
                    Mira los tonos en acción, novedades y contenido de la marca.
                  </p>
                </div>

                <span className="font-body text-sm font-medium text-accent group-hover:underline underline-offset-4 transition-all">
                  Seguirnos →
                </span>
              </a>
            )}

            {/* Horario */}
            <div className="bg-card border border-rim rounded-2xl p-7 flex flex-col gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#f9edf2' }}
              >
                <Clock size={20} className="text-accent" strokeWidth={1.5} />
              </div>

              <div>
                <h3 className="font-display text-xl text-fg mb-1">Horarios</h3>
                <p className="font-body text-sm text-fg-2 leading-[1.65]">
                  Lunes a sábado de 8 am a 8 pm. Los domingos respondo en la medida de lo posible.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-fg-3">Lunes – Sábado</span>
                  <span className="font-body text-xs font-medium text-fg">8:00 – 20:00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-xs text-fg-3">Domingos</span>
                  <span className="font-body text-xs font-medium text-fg">Variable</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-alt border-y border-rim">
        <div className="max-w-3xl mx-auto px-4">

          <div className="flex items-center gap-3 mb-10">
            <div className="w-px h-8 bg-accent shrink-0" />
            <h2 className="font-display text-2xl text-fg">Preguntas frecuentes</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-card border border-rim rounded-2xl px-7 py-6">
                <p className="font-body text-sm font-semibold text-fg mb-2">{q}</p>
                <p className="font-body text-sm text-fg-2 leading-[1.7]">{a}</p>
              </div>
            ))}
          </div>

          <p className="font-body text-sm text-fg-3 text-center mt-8">
            ¿No encuentras tu respuesta?{' '}
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline underline-offset-4">
              Escríbeme por WhatsApp
            </a>
          </p>

        </div>
      </section>

    </main>
  )
}
