'use client'

import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingBag, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { checkoutFormSchema, type CheckoutFormData } from '@/lib/validations/checkout'
import { Input } from '@/components/ui/Input'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CheckoutClientProps {
  deliveryFee: number
  prefilledData?: Partial<CheckoutFormData> | null
  hasSession?: boolean
}

type FormFields = keyof CheckoutFormData

// ─── Progress bar ─────────────────────────────────────────────────────────────

function CheckoutProgress({ step }: { step: 1 | 2 }) {
  return (
    <div className="mb-8">
      <p className="font-body text-xs text-fg-3 mb-2">
        Paso {step} de 2 —{' '}
        <span className="text-fg">{step === 1 ? 'Datos de envío' : 'Pago'}</span>
      </p>
      <div className="flex gap-1.5">
        <div className="h-1 flex-1 rounded-full bg-accent" />
        <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-accent' : 'bg-rim'}`} />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CheckoutClient({ deliveryFee, prefilledData, hasSession }: CheckoutClientProps) {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const savedData = useCartStore((s) => s.checkoutData)
  const setCheckoutData = useCartStore((s) => s.setCheckoutData)
  const total = useCartStore((s) => s.total)

  const subtotal = total()
  const grandTotal = subtotal + deliveryFee

  const [form, setForm] = useState<CheckoutFormData>({
    customer_name: prefilledData?.customer_name ?? savedData?.customer_name ?? '',
    customer_email: prefilledData?.customer_email ?? savedData?.customer_email ?? '',
    customer_phone: prefilledData?.customer_phone ?? savedData?.customer_phone ?? '',
    address: savedData?.address ?? '',
    neighborhood: savedData?.neighborhood ?? '',
    notes: savedData?.notes ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<FormFields, string>>>({})
  const [touched, setTouched] = useState<Set<FormFields>>(new Set())
  const [summaryOpen, setSummaryOpen] = useState(false)

  // Redirect to catálogo if cart becomes empty
  useEffect(() => {
    if (items.length === 0) {
      router.replace('/catalogo')
    }
  }, [items.length, router])

  if (items.length === 0) return null

  function validateField(field: FormFields, value: string) {
    const schema = checkoutFormSchema.shape[field]
    if (!schema) return
    const result = (schema as { safeParse: (v: unknown) => { success: boolean; error?: { errors: Array<{ message: string }> } } }).safeParse(value || undefined)
    setErrors((prev) => ({
      ...prev,
      [field]: result.success ? '' : result.error?.errors[0]?.message ?? '',
    }))
  }

  function handleChange(field: FormFields, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (touched.has(field)) validateField(field, value)
  }

  function handleBlur(field: FormFields) {
    setTouched((prev) => new Set(prev).add(field))
    validateField(field, form[field] ?? '')
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Validate all fields
    const result = checkoutFormSchema.safeParse({
      ...form,
      notes: form.notes || undefined,
    })

    if (!result.success) {
      const flat = result.error.flatten().fieldErrors
      const newErrors: Partial<Record<FormFields, string>> = {}
      for (const [k, v] of Object.entries(flat)) {
        newErrors[k as FormFields] = v?.[0] ?? ''
      }
      setErrors(newErrors)
      // Touch all fields
      setTouched(new Set(Object.keys(form) as FormFields[]))
      // Scroll to first error
      const firstKey = Object.keys(flat)[0]
      if (firstKey) {
        document.querySelector(`[name="${firstKey}"]`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
      return
    }

    setCheckoutData(result.data)
    router.push('/checkout/pago')
  }

  const isFormValid = checkoutFormSchema.safeParse({
    ...form,
    notes: form.notes || undefined,
  }).success

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 pb-22 lg:pb-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-fg">Finalizar pedido</h1>
      </div>

      <CheckoutProgress step={1} />

      {/* ── Resumen colapsable — solo mobile ── */}
      <div className="lg:hidden mb-6 bg-card border border-rim rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-body"
        >
          <span className="text-fg-2">Resumen del pedido</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gold">${grandTotal.toLocaleString('es-CO')}</span>
            <ChevronDown
              size={16}
              className={`text-fg-3 transition-transform duration-200 ${summaryOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>
        {summaryOpen && (
          <div className="px-4 pb-4 border-t border-rim space-y-3 pt-3">
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.shadeId} className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-alt shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.productName} fill sizes="40px" className="object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center">
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: item.shadeHex }} />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-xs font-medium text-fg truncate">{item.productName}</p>
                    <p className="font-body text-[11px] text-fg-3">× {item.quantity} · {item.shadeName}</p>
                  </div>
                  <p className="font-body text-xs font-medium text-fg shrink-0">
                    ${(item.unitPrice * item.quantity).toLocaleString('es-CO')}
                  </p>
                </div>
              ))}
            </div>
            <hr className="border-rim" />
            <div className="flex justify-between text-sm font-body text-fg-2">
              <span>Subtotal</span><span>${subtotal.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-sm font-body text-fg-2">
              <span>Domicilio</span><span>${deliveryFee.toLocaleString('es-CO')}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* ─ Formulario ─ */}
        <div className="bg-card border border-rim rounded-2xl p-6">
          <h2 className="font-display text-xl text-fg mb-5">Datos de envío</h2>

          {hasSession && prefilledData && (
            <p className="text-xs font-body text-fg-3 bg-highlight px-3 py-2 rounded-lg mb-5">
              Datos precargados de tu cuenta. Puedes editarlos.
            </p>
          )}

          <form id="checkout-form" onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              name="customer_name"
              label="Nombre completo"
              placeholder="Tu nombre completo"
              value={form.customer_name}
              error={touched.has('customer_name') ? errors.customer_name : undefined}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('customer_name', e.target.value)}
              onBlur={() => handleBlur('customer_name')}
              autoComplete="name"
            />

            <Input
              name="customer_email"
              type="email"
              label="Correo electrónico"
              placeholder="tucorreo@ejemplo.com"
              value={form.customer_email}
              error={touched.has('customer_email') ? errors.customer_email : undefined}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('customer_email', e.target.value)}
              onBlur={() => handleBlur('customer_email')}
              autoComplete="email"
            />

            <Input
              name="customer_phone"
              type="tel"
              label="Número de celular"
              placeholder="300 000 0000"
              value={form.customer_phone}
              error={touched.has('customer_phone') ? errors.customer_phone : undefined}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('customer_phone', e.target.value)}
              onBlur={() => handleBlur('customer_phone')}
              autoComplete="tel"
            />

            <Input
              name="address"
              label="Dirección completa"
              placeholder="Calle, número, apartamento"
              value={form.address}
              error={touched.has('address') ? errors.address : undefined}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('address', e.target.value)}
              onBlur={() => handleBlur('address')}
              autoComplete="street-address"
            />
            <p className="mt-1! text-xs font-body text-fg-3">Incluye número de casa/apartamento</p>

            <Input
              name="neighborhood"
              label="Barrio"
              placeholder="Nombre del barrio"
              value={form.neighborhood}
              error={touched.has('neighborhood') ? errors.neighborhood : undefined}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('neighborhood', e.target.value)}
              onBlur={() => handleBlur('neighborhood')}
            />

            {/* Ciudad — solo lectura */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-body font-medium text-fg-2">Ciudad</label>
              <div className="w-full rounded-lg border border-rim px-3 py-2 text-sm bg-alt text-fg-2 cursor-not-allowed select-none">
                Pasto, Nariño
              </div>
              <p className="text-xs font-body text-fg-3">Solo realizamos envíos dentro de Pasto</p>
            </div>

            {/* Notas */}
            <div className="flex flex-col gap-1">
              <label htmlFor="notes" className="text-sm font-body font-medium text-fg-2">
                Notas para el pedido <span className="text-fg-3 font-normal">(opcional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Indicaciones especiales para la entrega..."
                maxLength={200}
                value={form.notes ?? ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                onBlur={() => handleBlur('notes')}
                rows={3}
                className="w-full rounded-lg border border-rim px-3 py-2 text-sm bg-card text-fg outline-none transition-colors duration-150 placeholder:text-fg-2 focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
              />
              <div className="flex justify-between">
                {errors.notes && touched.has('notes') ? (
                  <p className="text-xs text-error">{errors.notes}</p>
                ) : (
                  <span />
                )}
                <p className="text-xs font-body text-fg-3 text-right">
                  {(form.notes ?? '').length}/200
                </p>
              </div>
            </div>

            {/* Submit — solo visible en desktop; en mobile es el botón sticky */}
            <button
              type="submit"
              disabled={!isFormValid}
              className="hidden lg:block w-full py-3.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              Continuar al pago
            </button>
          </form>
        </div>

        {/* ─ Resumen del pedido (sticky) ─ */}
        <div className="bg-card border border-rim rounded-2xl p-5 lg:sticky lg:top-24 space-y-4">
          <h2 className="font-display text-base text-fg">Resumen de tu pedido</h2>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
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
          </div>

          <hr className="border-rim" />

          <div className="space-y-1.5 text-sm font-body">
            <div className="flex justify-between text-fg-2">
              <span>Subtotal</span>
              <span>${subtotal.toLocaleString('es-CO')}</span>
            </div>
            <div className="flex justify-between text-fg-2">
              <span>Domicilio a Pasto</span>
              <span>${deliveryFee.toLocaleString('es-CO')}</span>
            </div>
          </div>

          <hr className="border-rim" />

          <div className="flex justify-between font-body font-semibold text-fg">
            <span>Total</span>
            <span className="text-gold">${grandTotal.toLocaleString('es-CO')}</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs font-body text-fg-3">
            <ShoppingBag size={11} />
            <Link href="/catalogo" className="hover:text-accent transition-colors">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>

      {/* ── Botón sticky en mobile ── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 px-4 py-3 bg-alt border-t border-[#e8d0c0] dark:border-rim">
        <button
          type="submit"
          form="checkout-form"
          disabled={!isFormValid}
          className="w-full h-14 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar al pago
        </button>
      </div>
    </main>
  )
}
