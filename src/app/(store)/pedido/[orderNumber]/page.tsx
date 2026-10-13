import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, Circle, Home } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types/database'
import type { Order, OrderItem } from '@/types/orders'
import { CopyButton } from '@/components/ui/CopyButton'
import { OrderCheckAnimation } from '@/components/store/OrderCheckAnimation'
import { CancelOrderButton } from '@/components/store/CancelOrderButton'
import { formatDateTime } from '@/lib/format'

interface PageProps {
  params: Promise<{ orderNumber: string }>
}

// ─── Timeline config ──────────────────────────────────────────────────────────

const TIMELINE_STEPS: Array<{ key: OrderStatus; label: string }> = [
  { key: 'pending_payment', label: 'Pendiente de pago' },
  { key: 'paid', label: 'Pago confirmado' },
  { key: 'preparing', label: 'En preparación' },
  { key: 'shipped', label: 'En camino' },
  { key: 'delivered', label: 'Entregado' },
]

const STATUS_MESSAGES: Partial<Record<OrderStatus, string>> = {
  pending_payment: 'Solo falta el pago para activarlo.',
  paid: '¡Pago recibido! Estamos preparando tu pedido con amor.',
  preparing: 'Tu pedido está en preparación. Pronto estará en camino.',
  shipped: '¡Tu pedido está en camino! Pronto llegará a tu puerta.',
  delivered: '¡Tu pedido fue entregado! Esperamos que ames tu maquillaje Vèloire.',
  cancelled: 'Este pedido fue cancelado.',
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function getOrder(orderNumber: string): Promise<Order | null> {
  try {
    const supabase = await createClient()
    const { data: rows } = await supabase
      .from('orders')
      .select(`
        id, order_number, status, customer_name, customer_email,
        address, neighborhood, city, subtotal, delivery_fee, total,
        payment_confirmed_at, payment_expires_at, created_at,
        order_items(id, product_name, shade_name, shade_hex, image_url, quantity, unit_price, subtotal)
      `)
      .eq('order_number', orderNumber)
      .limit(1)
    return (rows as Order[] | null)?.[0] ?? null
  } catch {
    return null
  }
}

// ─── Timeline component ───────────────────────────────────────────────────────

function OrderTimeline({ status }: { status: OrderStatus }) {
  const currentIndex = TIMELINE_STEPS.findIndex((s) => s.key === status)
  if (currentIndex === -1) return null // e.g. cancelled — don't show timeline

  return (
    <div className="mt-8">
      <div className="flex items-start gap-0">
        {TIMELINE_STEPS.map((step, i) => {
          const isPast = i < currentIndex
          const isCurrent = i === currentIndex
          return (
            <div key={step.key} className="flex-1 flex flex-col items-center gap-1.5">
              {/* Icon + connector */}
              <div className="flex items-center w-full">
                {i > 0 && (
                  <div
                    className={`flex-1 h-0.5 ${isPast || isCurrent ? 'bg-accent' : 'bg-rim'}`}
                  />
                )}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                    isPast
                      ? 'bg-success border-success text-white'
                      : isCurrent
                      ? 'bg-accent border-accent text-white'
                      : 'bg-card border-rim text-fg-3'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 size={14} strokeWidth={2.5} />
                  ) : (
                    <Circle size={10} strokeWidth={2.5} />
                  )}
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 ${isPast ? 'bg-accent' : 'bg-rim'}`} />
                )}
              </div>
              {/* Label */}
              <p
                className={`text-center text-[10px] font-body leading-tight px-1 ${
                  isCurrent ? 'text-accent font-medium' : isPast ? 'text-fg-2' : 'text-fg-3'
                }`}
              >
                {step.label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PedidoPage({ params }: PageProps) {
  const { orderNumber } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const order = await getOrder(orderNumber)

  if (!order) notFound()

  const isPendingPayment = order.status === 'pending_payment'
  const isCancelled = order.status === 'cancelled'
  const statusMessage = STATUS_MESSAGES[order.status] ?? ''
  const canCancel = isPendingPayment && !!user && user.email === order.customer_email

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      {/* Animated check — only for pending_payment */}
      {isPendingPayment && <OrderCheckAnimation />}

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="font-display text-3xl text-fg mb-2">
          {isPendingPayment ? '¡Pedido recibido!' : 'Estado de tu pedido'}
        </h1>
        {statusMessage && (
          <p className="font-body text-sm text-fg-2 leading-relaxed">{statusMessage}</p>
        )}
      </div>

      {/* Order number */}
      <div className="flex items-center justify-center gap-2 bg-highlight border border-rim rounded-xl px-5 py-3 mb-6 mx-auto max-w-sm">
        <p className="font-body text-sm font-medium text-fg tracking-wide">
          {order.order_number}
        </p>
        <CopyButton
          value={order.order_number}
          label="Copiar número de orden"
          className="text-fg-3 hover:text-accent transition-colors"
        />
      </div>

      {/* Payment instruction (pending only) */}
      {isPendingPayment && (
        <p className="text-center font-body text-xs text-fg-3 leading-relaxed mb-4 max-w-sm mx-auto">
          Te avisaremos a{' '}
          <span className="font-medium text-fg">{order.customer_email}</span> cuando
          confirmemos tu pago.
          {order.payment_expires_at && (
            <>
              {' '}Tus productos están apartados hasta el{' '}
              <span className="font-medium text-fg">{formatDateTime(order.payment_expires_at)}</span>;
              si no recibimos el pago, el pedido se cancela automáticamente.
            </>
          )}
        </p>
      )}

      {/* Timeline */}
      {!isCancelled && <OrderTimeline status={order.status} />}

      {isCancelled && (
        <div className="text-center mt-4">
          <p className="font-body text-sm text-error">{STATUS_MESSAGES.cancelled}</p>
        </div>
      )}

      {/* Order details */}
      <div className="mt-8 bg-card border border-rim rounded-2xl p-5 space-y-4">
        <h2 className="font-display text-base text-fg">Detalle del pedido</h2>

        {/* Items */}
        <div className="space-y-3">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-alt shrink-0">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.product_name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span
                      className="w-5 h-5 rounded-full border border-rim"
                      style={{ backgroundColor: item.shade_hex }}
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-xs font-medium text-fg truncate">
                  {item.product_name}
                </p>
                <p className="font-body text-[11px] text-fg-2">{item.shade_name}</p>
                <p className="font-body text-[11px] text-fg-3">× {item.quantity}</p>
              </div>
              <p className="font-body text-xs font-medium text-fg shrink-0">
                ${item.subtotal.toLocaleString('es-CO')}
              </p>
            </div>
          ))}
        </div>

        <hr className="border-rim" />

        {/* Totals */}
        <div className="space-y-1.5 text-sm font-body">
          <div className="flex justify-between text-fg-2">
            <span>Subtotal</span>
            <span>${order.subtotal.toLocaleString('es-CO')}</span>
          </div>
          <div className="flex justify-between text-fg-2">
            <span>Domicilio</span>
            <span>${order.delivery_fee.toLocaleString('es-CO')}</span>
          </div>
          <div className="flex justify-between font-semibold text-fg pt-1">
            <span>Total</span>
            <span className="text-gold">${order.total.toLocaleString('es-CO')}</span>
          </div>
        </div>

        <hr className="border-rim" />

        {/* Delivery address */}
        <div>
          <p className="font-body text-xs text-fg-3 mb-0.5">Dirección de entrega</p>
          <p className="font-body text-sm text-fg">
            {order.address}, {order.neighborhood}, {order.city}
          </p>
        </div>
      </div>

      {/* Cancel order */}
      {canCancel && (
        <div className="mt-4 text-center">
          <CancelOrderButton orderId={order.id} />
        </div>
      )}

      {/* Back to store */}
      <div className="mt-4 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-rim text-fg-2 text-sm font-body hover:border-rim-2 hover:text-fg transition-colors"
        >
          <Home size={15} />
          Volver a la tienda
        </Link>
      </div>
    </main>
  )
}
