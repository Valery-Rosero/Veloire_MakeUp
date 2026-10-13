import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, OrderStatus } from '@/types/database'

// Toda la lógica de stock vive en las funciones de Supabase create_order y
// cancel_order (ver supabase/migrations/20261012_checkout_atomico.sql): ahí es
// donde se garantiza la atomicidad. Este módulo solo las llama y traduce errores.

type Db = SupabaseClient<Database>

export const PAYMENT_WINDOW_HOURS = 24
export const PAYMENT_WINDOW = `${PAYMENT_WINDOW_HOURS} hours`

// Solo Nequi: el efectivo y Bancolombia se retiraron el 2026-10-12. Los
// pedidos viejos con otro valor siguen guardados tal cual en la base.
export type PaymentMethod = 'nequi'

export interface OrderLine {
  shadeId: string
  quantity: number
}

export interface NewOrder {
  customer_name: string
  customer_email: string
  customer_phone: string
  address: string
  neighborhood: string
  city: string
  department: string
  notes?: string | null
  payment_method: PaymentMethod
  items: OrderLine[]
  expiresIn: string | null
}

export type CreateOrderResult =
  | { ok: true; orderId: string; orderNumber: string }
  | { ok: false; reason: 'stock_insuficiente'; productName: string; shadeName: string; available: number }
  | { ok: false; reason: 'invalid' | 'error'; message: string }

export async function createOrder(supabase: Db, order: NewOrder): Promise<CreateOrderResult> {
  const { data, error } = await supabase.rpc('create_order', {
    p_customer_name: order.customer_name,
    p_customer_email: order.customer_email,
    p_customer_phone: order.customer_phone,
    p_address: order.address,
    p_neighborhood: order.neighborhood,
    p_city: order.city,
    p_department: order.department,
    p_notes: order.notes ?? '',
    p_payment_method: order.payment_method,
    p_items: order.items.map((i) => ({ shade_id: i.shadeId, quantity: i.quantity })),
    p_expires_in: order.expiresIn,
  })

  if (error) {
    if (error.message === 'stock_insuficiente') {
      const detail = parseDetail(error.details)
      return {
        ok: false,
        reason: 'stock_insuficiente',
        productName: detail.product_name ?? 'Un producto',
        shadeName: detail.shade_name ?? '',
        available: detail.available ?? 0,
      }
    }
    if (error.message === 'carrito_vacio' || error.message === 'cantidad_invalida') {
      return { ok: false, reason: 'invalid', message: 'El carrito tiene productos o cantidades inválidas.' }
    }
    return { ok: false, reason: 'error', message: error.message }
  }

  const { order_id, order_number } = data as { order_id: string; order_number: string }
  return { ok: true, orderId: order_id, orderNumber: order_number }
}

// Cancela y devuelve el stock una sola vez. `cancelled: false` significa que el
// pedido ya estaba cancelado/entregado (o no tenía el estado exigido), sin error.
export async function cancelOrderAndRestock(
  supabase: Db,
  orderId: string,
  onlyIfStatus?: OrderStatus
): Promise<{ cancelled: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('cancel_order', {
    p_order_id: orderId,
    p_only_if_status: onlyIfStatus ?? null,
  })
  if (error) return { cancelled: false, error: error.message }
  return { cancelled: data === true }
}

function parseDetail(details: string | undefined): {
  product_name?: string
  shade_name?: string
  available?: number
} {
  try {
    return details ? JSON.parse(details) : {}
  } catch {
    return {}
  }
}
