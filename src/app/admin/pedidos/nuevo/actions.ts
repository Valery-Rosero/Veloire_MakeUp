'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth-guard'
import { logAdminAction } from '@/lib/audit-log'
import { createOrder, type PaymentMethod } from '@/lib/orders'
import { revalidateCatalog } from '@/lib/revalidate-storefront'

export interface AdminOrderItem {
  productId: string
  shadeId: string
  productName: string
  shadeName: string
  shadeHex: string
  imageUrl: string
  unitPrice: number
  quantity: number
}

export interface CreateAdminOrderInput {
  customer_name: string
  customer_email: string
  customer_phone: string
  address: string
  neighborhood: string
  city: string
  department: string
  notes: string
  payment_method: PaymentMethod
  items: AdminOrderItem[]
}

export async function createAdminOrder(
  input: CreateAdminOrderInput
): Promise<{ orderId: string } | { error: string }> {
  const admin = await requireAdmin()
  try {
    if (input.items.length === 0) return { error: 'Agrega al menos un producto al pedido' }

    const supabase = await createAdminClient()

    // Los pedidos manuales también apartan stock al crearse, pero no vencen:
    // la admin acordó el pago directamente con la clienta.
    const result = await createOrder(supabase, {
      ...input,
      items: input.items.map((i) => ({ shadeId: i.shadeId, quantity: i.quantity })),
      expiresIn: null,
    })

    if (!result.ok) {
      if (result.reason === 'stock_insuficiente') {
        return {
          error: `No hay stock suficiente de "${result.productName} — ${result.shadeName}" (quedan ${result.available}).`,
        }
      }
      return { error: result.message }
    }

    await logAdminAction({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'order.create',
      entityType: 'order',
      entityId: result.orderId,
      entityLabel: result.orderNumber,
    })

    revalidatePath('/admin/pedidos')
    revalidateCatalog()
    return { orderId: result.orderId }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error inesperado' }
  }
}
