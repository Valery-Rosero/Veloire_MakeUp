'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Trash2, Check } from 'lucide-react'
import { formatPrice } from '@/lib/format'
import { createAdminOrder } from '@/app/admin/pedidos/nuevo/actions'
import type { AdminOrderItem } from '@/app/admin/pedidos/nuevo/actions'

interface Shade {
  id: string
  name: string
  hex: string
  stock: number
}

export interface ProductOption {
  id: string
  name: string
  price: number
  imageUrl?: string
  shades: Shade[]
}

const PAYMENT_OPTIONS = [
  { value: 'nequi' as const, label: 'Nequi' },
  { value: 'bancolombia' as const, label: 'Bancolombia' },
  { value: 'efectivo' as const, label: 'Efectivo' },
]

const inputCls =
  'w-full border border-rim rounded-lg px-3 py-2 text-sm font-body bg-page text-fg focus:outline-none focus:border-rim-2 transition-colors placeholder:text-fg-2'

export function CreateOrderForm({
  products,
  deliveryFee,
}: {
  products: ProductOption[]
  deliveryFee: number
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Picker state
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedShadeId, setSelectedShadeId] = useState('')
  const [pickQty, setPickQty] = useState(1)

  // Cart items
  const [items, setItems] = useState<AdminOrderItem[]>([])

  // Customer
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [address, setAddress] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('Pasto')
  const [department, setDepartment] = useState('Nariño')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'nequi' | 'bancolombia' | 'efectivo'>('nequi')

  const [error, setError] = useState<string | null>(null)

  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const selectedShade = selectedProduct?.shades.find((s) => s.id === selectedShadeId)

  function addItem() {
    if (!selectedProduct || !selectedShade) return
    const maxStock = selectedShade.stock
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.productId === selectedProductId && i.shadeId === selectedShadeId
      )
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = {
          ...next[idx],
          quantity: Math.min(maxStock, next[idx].quantity + pickQty),
        }
        return next
      }
      return [
        ...prev,
        {
          productId: selectedProductId,
          shadeId: selectedShadeId,
          productName: selectedProduct.name,
          shadeName: selectedShade.name,
          shadeHex: selectedShade.hex,
          imageUrl: selectedProduct.imageUrl ?? '',
          unitPrice: selectedProduct.price,
          quantity: Math.min(maxStock, pickQty),
        },
      ]
    })
    setSelectedShadeId('')
    setPickQty(1)
  }

  function removeItem(productId: string, shadeId: string) {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.shadeId === shadeId)))
  }

  function changeQty(productId: string, shadeId: string, delta: number) {
    const maxStock =
      products.find((p) => p.id === productId)?.shades.find((s) => s.id === shadeId)?.stock ??
      Infinity
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.shadeId === shadeId
          ? { ...i, quantity: Math.min(maxStock, Math.max(1, i.quantity + delta)) }
          : i
      )
    )
  }

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const total = subtotal + deliveryFee

  function handleSubmit() {
    setError(null)
    if (items.length === 0) { setError('Agrega al menos un producto al pedido'); return }
    if (!customerName.trim()) { setError('El nombre del cliente es requerido'); return }
    if (!/^\d{10}$/.test(customerPhone.trim())) {
      setError('El celular debe tener exactamente 10 dígitos')
      return
    }
    if (!address.trim()) { setError('La dirección es requerida'); return }
    if (!neighborhood.trim()) { setError('El barrio es requerido'); return }

    startTransition(async () => {
      const result = await createAdminOrder({
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        customer_phone: customerPhone.trim(),
        address: address.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        department: department.trim(),
        notes: notes.trim(),
        payment_method: paymentMethod,
        items,
      })
      if ('error' in result) {
        setError(result.error)
      } else {
        router.push(`/admin/pedidos/${result.orderId}`)
      }
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 pb-10">

      {/* ── Columna izquierda: datos del cliente ── */}
      <div className="space-y-5">

        {/* Datos del cliente */}
        <section className="bg-card border border-rim rounded-2xl p-5">
          <h2 className="font-display text-base text-fg mb-4">Datos del cliente</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-body text-xs text-fg-3">Nombre completo *</span>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ana García"
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-body text-xs text-fg-3">Celular * (10 dígitos)</span>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="3001234567"
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="font-body text-xs text-fg-3">Correo electrónico (opcional)</span>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="ana@ejemplo.com"
                className={inputCls}
              />
            </label>
          </div>
        </section>

        {/* Dirección */}
        <section className="bg-card border border-rim rounded-2xl p-5">
          <h2 className="font-display text-base text-fg mb-4">Dirección de entrega</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="font-body text-xs text-fg-3">Dirección *</span>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Cra 25 # 18-40 Apto 301"
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-body text-xs text-fg-3">Barrio *</span>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="El Faro"
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-body text-xs text-fg-3">Ciudad</span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-body text-xs text-fg-3">Departamento</span>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={inputCls}
              />
            </label>
          </div>
        </section>

        {/* Notas y método de pago */}
        <section className="bg-card border border-rim rounded-2xl p-5">
          <h2 className="font-display text-base text-fg mb-4">Detalles del pedido</h2>
          <div className="space-y-4">
            <label className="flex flex-col gap-1">
              <span className="font-body text-xs text-fg-3">Notas (opcional)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Indicaciones de entrega, referencias..."
                rows={2}
                maxLength={200}
                className={`${inputCls} resize-none`}
              />
            </label>
            <div>
              <p className="font-body text-xs text-fg-3 mb-2">Método de pago</p>
              <div className="flex gap-2 flex-wrap">
                {PAYMENT_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPaymentMethod(value)}
                    className={`px-4 py-2 rounded-lg text-sm font-body border transition-colors ${
                      paymentMethod === value
                        ? 'bg-noir text-beige border-noir'
                        : 'bg-page border-rim text-fg-2 hover:border-rim-2'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Columna derecha: productos + resumen ── */}
      <div className="space-y-5">

        {/* Selector de producto */}
        <section className="bg-card border border-rim rounded-2xl p-5">
          <h2 className="font-display text-base text-fg mb-4">Agregar producto</h2>

          <label className="flex flex-col gap-1 mb-1">
            <span className="font-body text-xs text-fg-3">Producto</span>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value)
                setSelectedShadeId('')
                setPickQty(1)
              }}
              className={inputCls}
            >
              <option value="">— Selecciona un producto —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {formatPrice(p.price)}
                </option>
              ))}
            </select>
          </label>
          <p className="font-body text-[11px] text-fg-3 mb-3">
            Agrega varios tonos del mismo producto, o cambia el selector para agregar otro.
          </p>

          {selectedProduct && (
            <>
              <p className="font-body text-xs text-fg-3 mb-2">Tono</p>
              {selectedProduct.shades.length === 0 ? (
                <p className="font-body text-xs text-fg-3 italic mb-3">Sin tonos disponibles con stock</p>
              ) : (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedProduct.shades.map((shade) => (
                    <button
                      key={shade.id}
                      type="button"
                      title={`${shade.name} (${shade.stock} disponibles)`}
                      onClick={() => setSelectedShadeId(shade.id)}
                      className={`relative w-9 h-9 rounded-full border-2 transition-all ${
                        selectedShadeId === shade.id
                          ? 'border-fg scale-110 shadow-md'
                          : 'border-transparent hover:scale-105 hover:border-fg-3'
                      }`}
                      style={{ backgroundColor: shade.hex }}
                    >
                      {selectedShadeId === shade.id && (
                        <Check
                          size={12}
                          className="absolute inset-0 m-auto drop-shadow"
                          style={{ color: '#fff' }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {selectedShade && (
                <p className="font-body text-xs text-fg-2 mb-3">
                  <span className="font-medium">{selectedShade.name}</span>
                  {' · '}{selectedShade.stock} disponible{selectedShade.stock !== 1 ? 's' : ''}
                </p>
              )}
            </>
          )}

          {selectedShade && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center border border-rim rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setPickQty((q) => Math.max(1, q - 1))}
                  className="px-2.5 py-2 text-fg-2 hover:text-fg hover:bg-highlight transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="font-body text-sm text-fg w-8 text-center">{pickQty}</span>
                <button
                  type="button"
                  onClick={() => setPickQty((q) => Math.min(selectedShade.stock, q + 1))}
                  className="px-2.5 py-2 text-fg-2 hover:text-fg hover:bg-highlight transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="flex-1 py-2 rounded-lg bg-accent text-white text-sm font-body font-medium hover:opacity-90 transition-opacity"
              >
                Agregar al pedido
              </button>
            </div>
          )}
        </section>

        {/* Lista de artículos */}
        {items.length > 0 && (
          <section className="bg-card border border-rim rounded-2xl p-5">
            <h2 className="font-display text-base text-fg mb-3">
              Artículos ({items.length})
            </h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.shadeId}`}
                  className="flex items-center gap-2"
                >
                  <div
                    className="w-5 h-5 rounded-full shrink-0 border border-rim-2"
                    style={{ backgroundColor: item.shadeHex }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-fg truncate leading-tight">
                      {item.productName}
                    </p>
                    <p className="font-body text-xs text-fg-3">{item.shadeName}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => changeQty(item.productId, item.shadeId, -1)}
                      disabled={item.quantity <= 1}
                      className="text-fg-3 hover:text-fg transition-colors p-0.5 disabled:opacity-30"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-body text-sm text-fg w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => changeQty(item.productId, item.shadeId, 1)}
                      disabled={
                        item.quantity >=
                        (products.find((p) => p.id === item.productId)?.shades.find((s) => s.id === item.shadeId)?.stock ?? Infinity)
                      }
                      className="text-fg-3 hover:text-fg transition-colors p-0.5 disabled:opacity-30"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="font-body text-sm font-medium text-gold shrink-0 w-20 text-right">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId, item.shadeId)}
                    className="text-fg-3 hover:text-error transition-colors shrink-0 p-0.5"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Resumen y submit */}
        <section className="bg-card border border-rim rounded-2xl p-5">
          <h2 className="font-display text-base text-fg mb-3">Resumen del pedido</h2>
          <div className="space-y-2 font-body text-sm">
            <div className="flex justify-between text-fg-2">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-fg-2">
              <span>Domicilio</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-semibold text-fg border-t border-rim pt-2">
              <span>Total</span>
              <span className="text-gold">{formatPrice(total)}</span>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-xs font-body text-error bg-error/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="mt-4 w-full py-3 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? 'Creando pedido...' : 'Crear pedido'}
          </button>
        </section>
      </div>
    </div>
  )
}
