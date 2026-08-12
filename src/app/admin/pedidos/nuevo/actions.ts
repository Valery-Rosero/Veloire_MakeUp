'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth-guard'
import { logAdminAction } from '@/lib/audit-log'

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
  payment_method: 'nequi' | 'bancolombia' | 'efectivo'
  items: AdminOrderItem[]
}

export async function createAdminOrder(
  input: CreateAdminOrderInput
): Promise<{ orderId: string } | { error: string }> {
  const admin = await requireAdmin()
  try {
    if (input.items.length === 0) return { error: 'Agrega al menos un producto al pedido' }

    const supabase = await createAdminClient()

    const { data: feeRows } = await supabase
      .from('store_config')
      .select('value')
      .eq('key', 'delivery_fee')
      .limit(1)
    const delivery_fee = parseInt(
      (feeRows as Array<{ value: string }> | null)?.[0]?.value ?? '5000',
      10
    )

    const subtotal = input.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
    const total = subtotal + delivery_fee

    const { data: orderNumber, error: rpcError } = await supabase.rpc('generate_order_number')
    if (rpcError) return { error: 'Error generando número de pedido' }

    const { data: orderRows, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: input.customer_name,
        customer_email: input.customer_email,
        customer_phone: input.customer_phone,
        address: input.address,
        neighborhood: input.neighborhood,
        city: input.city,
        department: input.department,
        notes: input.notes || null,
        payment_method: input.payment_method,
        subtotal,
        delivery_fee,
        total,
        status: 'pending_payment',
      })
      .select('id')

    if (orderError) return { error: orderError.message }

    const orderId = (orderRows as Array<{ id: string }> | null)?.[0]?.id
    if (!orderId) return { error: 'No se pudo obtener el ID del pedido' }

    const { error: itemsError } = await supabase.from('order_items').insert(
      input.items.map((item) => ({
        order_id: orderId,
        product_id: item.productId,
        shade_id: item.shadeId,
        product_name: item.productName,
        shade_name: item.shadeName,
        shade_hex: item.shadeHex,
        image_url: item.imageUrl,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.unitPrice * item.quantity,
      }))
    )

    if (itemsError) return { error: itemsError.message }

    await logAdminAction({
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'order.create',
      entityType: 'order',
      entityId: orderId,
      entityLabel: orderNumber,
    })

    revalidatePath('/admin/pedidos')
    return { orderId }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error inesperado' }
  }
}
