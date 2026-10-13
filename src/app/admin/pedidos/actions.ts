'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-guard'
import { logAdminAction } from '@/lib/audit-log'
import type { OrderStatus } from '@/types/database'
import { sendOrderCancelledEmail } from '@/lib/email/send-order-cancelled'
import { revalidateCatalog } from '@/lib/revalidate-storefront'
import { cancelOrderAndRestock } from '@/lib/orders'

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  const supabase = await createAdminClient()
  const { data: orderRow } = await supabase
    .from('orders')
    .select('status, order_number')
    .eq('id', orderId)
    .single()

  // Cancelar siempre pasa por cancel_order, que devuelve el stock una sola vez.
  if (status === 'cancelled') {
    const { cancelled, error } = await cancelOrderAndRestock(supabase, orderId)
    if (error) return { error }
    if (cancelled) revalidateCatalog()
  } else {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
    if (error) return { error: error.message }
  }

  await logAdminAction({
    actorId: admin.id,
    actorEmail: admin.email,
    action: 'order.status_update',
    entityType: 'order',
    entityId: orderId,
    entityLabel: orderRow?.order_number ?? null,
    details: { from: orderRow?.status ?? null, to: status },
  })

  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${orderId}`)
  return {}
}

export async function cancelOrder(orderId: string): Promise<{ success: true } | { error: string }> {
  const admin = await requireAdmin()
  const supabase = await createAdminClient()

  const { data: order } = await supabase
    .from('orders')
    .select('customer_email, customer_name, order_number')
    .eq('id', orderId)
    .single()

  const { cancelled, error } = await cancelOrderAndRestock(supabase, orderId)
  if (error) return { error }
  if (!cancelled) return { error: 'El pedido ya estaba cancelado o entregado.' }

  revalidateCatalog()

  if (order) {
    await sendOrderCancelledEmail({
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
    })
  }

  await logAdminAction({
    actorId: admin.id,
    actorEmail: admin.email,
    action: 'order.cancel',
    entityType: 'order',
    entityId: orderId,
    entityLabel: order?.order_number ?? null,
  })

  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${orderId}`)
  return { success: true }
}

export async function deleteOrder(orderId: string): Promise<{ success: true } | { error: string }> {
  const admin = await requireAdmin()
  const supabase = await createAdminClient()

  const { data: order } = await supabase
    .from('orders')
    .select('status, order_number')
    .eq('id', orderId)
    .single()

  if (!order) return { error: 'Pedido no encontrado' }
  if (order.status !== 'cancelled') return { error: 'Solo se pueden eliminar pedidos cancelados' }

  // Eliminar registros hijos (por si no hay CASCADE en la DB)
  await Promise.all([
    supabase.from('order_items').delete().eq('order_id', orderId),
    supabase.from('order_status_history').delete().eq('order_id', orderId),
    supabase.from('email_notifications').delete().eq('order_id', orderId),
  ])

  const { error } = await supabase.from('orders').delete().eq('id', orderId)
  if (error) return { error: error.message }

  await logAdminAction({
    actorId: admin.id,
    actorEmail: admin.email,
    action: 'order.delete',
    entityType: 'order',
    entityId: orderId,
    entityLabel: order.order_number,
  })

  revalidatePath('/admin/pedidos')
  return { success: true }
}
