'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, Loader2, ArrowLeft } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCartStore } from '@/lib/store/cart'
import { CopyButton } from '@/components/ui/CopyButton'
import { PAYMENT_WINDOW_HOURS } from '@/lib/orders'

interface PagoClientProps {
  nequiNumber: string
  nequiName: string
  deliveryFee: number
}

function CheckoutProgress() {
  return (
    <div className="mb-8">
      <p className="font-body text-xs text-fg-3 mb-2">
        Paso 2 de 2 — <span className="text-fg">Pago</span>
      </p>
      <div className="flex gap-1.5">
        <div className="h-1 flex-1 rounded-full bg-accent" />
        <div className="h-1 flex-1 rounded-full bg-accent" />
      </div>
    </div>
  )
}

export function PagoClient({ nequiNumber, nequiName, deliveryFee }: PagoClientProps) {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const checkoutData = useCartStore((s) => s.checkoutData)
  const clearCart = useCartStore((s) => s.clearCart)
  const clearCheckoutData = useCartStore((s) => s.clearCheckoutData)
  const total = useCartStore((s) => s.total)

  const subtotal = total()
  const grandTotal = subtotal + deliveryFee

  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Redirect if missing data
  useEffect(() => {
    if (!checkoutData || items.length === 0) {
      router.replace('/checkout')
    }
  }, [checkoutData, items.length, router])

  if (!checkoutData || items.length === 0) return null

  async function handleConfirm() {
    if (!checkoutData) return
    setLoading(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...checkoutData,
          city: 'Pasto',
          department: 'Nariño',
          payment_method: 'nequi',
          items,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Error desconocido' }))
        if (res.status === 409 && body.error === 'stock_insuficiente') {
          setErrorMsg(
            `"${body.productName} — ${body.shadeName}" ya no está disponible (quedan ${body.available ?? 0} unidades). Por favor actualiza tu carrito antes de continuar.`
          )
          setLoading(false)
          return
        }
        throw new Error(body.error ?? 'No se pudo crear el pedido')
      }

      const { orderNumber } = await res.json()
      clearCart()
      clearCheckoutData()
      router.push(`/pedido/${orderNumber}`)
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Hubo un problema al crear tu pedido. Inténtalo de nuevo.'
      )
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-fg">Pagar por Nequi</h1>
      </div>

      <CheckoutProgress />

      {/* ─ Tarjeta de instrucciones ─ */}
      <div className="bg-card border border-rim rounded-2xl p-6 mb-4">
        <h2 className="font-body text-base font-medium text-fg mb-4">Realiza tu transferencia</h2>

        {/* Monto */}
        <div className="bg-highlight rounded-xl p-4 text-center mb-5">
          <p className="font-display text-4xl text-gold mb-1">
            ${grandTotal.toLocaleString('es-CO')}
          </p>
          <p className="font-body text-xs text-fg-3">Monto exacto a transferir</p>
        </div>

        <hr className="border-rim mb-5" />

        {/* Número Nequi */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-body text-xs text-fg-3 mb-0.5">Número Nequi</p>
              <p className="font-body text-xl font-semibold text-fg tracking-wider">
                {nequiNumber}
              </p>
            </div>
            <CopyButton
              value={nequiNumber}
              label="Copiar número"
              className="w-9 h-9 rounded-lg border border-rim text-fg-2 hover:text-accent hover:border-accent transition-colors"
            />
          </div>

          {nequiName && (
            <p className="font-body text-sm text-fg-2">
              A nombre de:{' '}
              <span className="font-medium text-fg">{nequiName}</span>
            </p>
          )}
        </div>

        <hr className="border-rim my-5" />

        <p className="font-body text-xs text-fg-2 leading-relaxed">
          Transfiere el monto exacto y guarda el comprobante. Tu pedido se activará
          una vez confirmemos el pago. Te avisaremos por correo.
        </p>
        <p className="font-body text-xs text-fg-2 leading-relaxed mt-2">
          Apartamos tus productos por <span className="font-medium text-fg">{PAYMENT_WINDOW_HOURS} horas</span>.
          Si no recibimos el pago en ese tiempo, el pedido se cancela automáticamente.
        </p>
      </div>

      {/* ─ Resumen colapsable ─ */}
      <div className="bg-card border border-rim rounded-2xl overflow-hidden mb-6">
        <button
          onClick={() => setOrderDetailsOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-4 text-sm font-body text-fg-2 hover:text-fg transition-colors"
        >
          <span>Ver detalle del pedido</span>
          {orderDetailsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <AnimatePresence initial={false}>
          {orderDetailsOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-3">
                <hr className="border-rim" />
                {items.map((item) => (
                  <div key={item.shadeId} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-alt shrink-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span
                            className="w-5 h-5 rounded-full"
                            style={{ backgroundColor: item.shadeHex }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-xs font-medium text-fg truncate">
                        {item.productName}
                      </p>
                      <p className="font-body text-[11px] text-fg-2">{item.shadeName}</p>
                      <p className="font-body text-[11px] text-fg-3">× {item.quantity}</p>
                    </div>
                    <p className="font-body text-xs font-medium text-fg shrink-0">
                      ${(item.unitPrice * item.quantity).toLocaleString('es-CO')}
                    </p>
                  </div>
                ))}

                <hr className="border-rim" />
                <div className="space-y-1 text-sm font-body">
                  <div className="flex justify-between text-fg-2">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between text-fg-2">
                    <span>Domicilio</span>
                    <span>${deliveryFee.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-fg pt-1">
                    <span>Total</span>
                    <span className="text-gold">${grandTotal.toLocaleString('es-CO')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─ Errores ─ */}
      <AnimatePresence>
        {errorMsg && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm font-body text-error bg-error/10 px-4 py-3 rounded-xl mb-4"
          >
            {errorMsg}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ─ Botones ─ */}
      <div className="space-y-3">
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Confirmando pedido...
            </>
          ) : (
            'Confirmar pedido'
          )}
        </button>

        <button
          onClick={() => router.back()}
          disabled={loading}
          className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-fg-2 text-sm font-body hover:text-fg transition-colors disabled:opacity-50"
        >
          <ArrowLeft size={15} />
          Volver a mis datos
        </button>
      </div>
    </main>
  )
}
