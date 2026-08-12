import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Clock, CreditCard, Package, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Política de envíos — Vèloire MakeUp',
  description: 'Información sobre envíos, tiempos de entrega y métodos de pago en Pasto, Nariño.',
}

async function getDeliveryFee(): Promise<number> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('store_config')
      .select('value')
      .eq('key', 'delivery_fee')
      .limit(1)
    const value = (data as Array<{ value: string }> | null)?.[0]?.value
    return value ? parseInt(value, 10) : 5000
  } catch {
    return 5000
  }
}

function formatPrice(n: number) {
  return `$${n.toLocaleString('es-CO')}`
}

const PAYMENT_METHODS = [
  {
    name: 'Nequi',
    desc: 'Transferencia inmediata. Te enviamos el número Nequi al confirmar tu pedido.',
    color: '#6C00D9',
    bg: '#f3eeff',
  },
  {
    name: 'Bancolombia',
    desc: 'Transferencia bancaria. Te damos el número de cuenta al finalizar tu compra.',
    color: '#FDB913',
    bg: '#fffbeb',
  },
  {
    name: 'Efectivo',
    desc: 'Pago contra entrega. Disponible para domicilios dentro de Pasto.',
    color: '#1D9E75',
    bg: '#edfaf5',
  },
]

const STEPS = [
  { icon: Package,      label: 'Haces tu pedido',       desc: 'Elige tus productos y completa el formulario de envío.' },
  { icon: CreditCard,   label: 'Realizas el pago',       desc: 'Transferes por Nequi, Bancolombia o pagas en efectivo al recibir.' },
  { icon: CheckCircle,  label: 'Confirmamos',             desc: 'Verificamos tu pago y preparamos tu pedido.' },
  { icon: MapPin,       label: 'Te lo llevamos',          desc: 'Domicilio a tu dirección en Pasto en 1 a 2 días hábiles.' },
]

export default async function EnviosPage() {
  const deliveryFee = await getDeliveryFee()

  return (
    <main>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <section className="bg-alt border-b border-rim py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p
            className="font-body uppercase text-accent mb-4"
            style={{ fontSize: '10px', letterSpacing: '4px' }}
          >
            Política de envíos
          </p>
          <h1 className="font-display text-[44px] md:text-[60px] text-fg leading-[1.06] tracking-tight mb-5">
            Llegamos a tu puerta
          </h1>
          <p className="font-body text-base text-fg-2 leading-[1.7] max-w-md mx-auto">
            Domicilio a toda la ciudad de Pasto, Nariño. Rápido, seguro y con atención personalizada.
          </p>
        </div>
      </section>

      {/* ── Info principal ────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-page">
        <div className="max-w-4xl mx-auto px-4">

          <div className="flex items-center gap-3 mb-10">
            <div className="w-px h-8 bg-accent shrink-0" />
            <h2 className="font-display text-2xl text-fg">Cobertura y tiempos</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

            <div className="bg-card border border-rim rounded-2xl p-6">
              <MapPin size={20} className="text-accent mb-3" strokeWidth={1.5} />
              <h3 className="font-display text-lg text-fg mb-2">Cobertura</h3>
              <p className="font-body text-sm text-fg-2 leading-[1.65]">
                Pasto, Nariño. Toda la ciudad, todos los barrios.
              </p>
            </div>

            <div className="bg-card border border-rim rounded-2xl p-6">
              <Clock size={20} className="text-accent mb-3" strokeWidth={1.5} />
              <h3 className="font-display text-lg text-fg mb-2">Tiempo de entrega</h3>
              <p className="font-body text-sm text-fg-2 leading-[1.65]">
                1 a 2 días hábiles a partir de la confirmación de pago.
              </p>
            </div>

            <div className="bg-card border border-rim rounded-2xl p-6">
              <CreditCard size={20} className="text-accent mb-3" strokeWidth={1.5} />
              <h3 className="font-display text-lg text-fg mb-2">Costo de domicilio</h3>
              <p className="font-display text-2xl text-fg-2 leading-tight">
                {formatPrice(deliveryFee)}
                <span className="font-body text-sm text-fg-3 ml-1">COP</span>
              </p>
            </div>

          </div>

          <div className="bg-highlight border border-rim rounded-2xl px-6 py-5">
            <p className="font-body text-sm text-fg-2 leading-[1.7]">
              <span className="font-semibold text-fg">¿Vives fuera de Pasto?</span>{' '}
              Por ahora solo hacemos domicilios dentro de la ciudad. Si te interesa que lleguemos
              a tu municipio, escríbenos —{' '}
              <Link href="/contacto" className="text-accent hover:underline underline-offset-4">
                estamos trabajando en expandir la cobertura
              </Link>.
            </p>
          </div>

        </div>
      </section>

      {/* ── Cómo funciona ─────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-alt border-y border-rim">
        <div className="max-w-4xl mx-auto px-4">

          <div className="flex items-center gap-3 mb-12">
            <div className="w-px h-8 bg-accent shrink-0" />
            <h2 className="font-display text-2xl text-fg">Cómo funciona</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {STEPS.map(({ icon: Icon, label, desc }, i) => (
              <div key={label} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#f9edf2' }}
                  >
                    <Icon size={16} className="text-accent" strokeWidth={1.5} />
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block flex-1 h-px bg-rim" />
                  )}
                </div>
                <div>
                  <p className="font-body text-xs text-fg-3 mb-0.5" style={{ letterSpacing: '1px' }}>
                    Paso {i + 1}
                  </p>
                  <p className="font-body text-sm font-semibold text-fg mb-1">{label}</p>
                  <p className="font-body text-sm text-fg-2 leading-[1.6]">{desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Métodos de pago ───────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-page">
        <div className="max-w-4xl mx-auto px-4">

          <div className="flex items-center gap-3 mb-10">
            <div className="w-px h-8 bg-accent shrink-0" />
            <h2 className="font-display text-2xl text-fg">Métodos de pago</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PAYMENT_METHODS.map(({ name, desc, color, bg }) => (
              <div key={name} className="bg-card border border-rim rounded-2xl p-6">
                <div
                  className="inline-flex items-center px-3 py-1 rounded-full mb-4"
                  style={{ backgroundColor: bg }}
                >
                  <span className="font-body text-sm font-semibold" style={{ color }}>
                    {name}
                  </span>
                </div>
                <p className="font-body text-sm text-fg-2 leading-[1.65]">{desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Política de devoluciones ──────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-alt border-y border-rim">
        <div className="max-w-3xl mx-auto px-4">

          <div className="flex items-center gap-3 mb-10">
            <div className="w-px h-8 bg-accent shrink-0" />
            <h2 className="font-display text-2xl text-fg">Cambios y devoluciones</h2>
          </div>

          <div className="space-y-4 font-body text-sm text-fg-2 leading-[1.85]">
            <p>
              Tu satisfacción es lo más importante. Si tu pedido llegó en mal estado, con un
              producto equivocado o hay cualquier error de nuestra parte, lo solucionamos sin
              complicaciones.
            </p>
            <p>
              Escríbenos dentro de las <span className="font-semibold text-fg">24 horas siguientes a la entrega</span>{' '}
              con una foto del problema y lo arreglamos — ya sea con un cambio o con la devolución
              del dinero.
            </p>
            <p className="text-fg-3">
              Por ser productos de maquillaje y por razones de higiene, no aceptamos cambios
              ni devoluciones en productos que ya fueron usados o abiertos, excepto cuando
              el problema es nuestro.
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
            >
              Contactarme para un cambio
            </Link>
          </div>

        </div>
      </section>

    </main>
  )
}
