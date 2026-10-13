'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { sendOrderCancelledEmail } from '@/lib/email/send-order-cancelled'
import { cancelOrderAndRestock } from '@/lib/orders'
import { revalidateCatalog } from '@/lib/revalidate-storefront'

export async function cancelOrder(orderId: string): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const { data: order } = await supabase
    .from('orders')
    .select('id, status, customer_email, customer_name, order_number')
    .eq('id', orderId)
    .single()

  if (!order) return { error: 'Pedido no encontrado' }
  if (order.customer_email !== user.email) return { error: 'No autorizado' }
  if (order.status !== 'pending_payment') return { error: 'Solo se pueden cancelar pedidos pendientes de pago' }

  // 'pending_payment' se vuelve a exigir dentro de la transacción: si la admin
  // confirmó el pago justo después de la verificación de arriba, no se cancela.
  const { cancelled, error } = await cancelOrderAndRestock(
    await createAdminClient(),
    orderId,
    'pending_payment'
  )
  if (error) return { error }
  if (!cancelled) return { error: 'Este pedido ya no se puede cancelar' }

  await sendOrderCancelledEmail({
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
  })

  revalidatePath(`/pedido/${order.order_number}`)
  revalidateCatalog()
  return { success: true }
}
