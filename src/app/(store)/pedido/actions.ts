'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sendOrderCancelledEmail } from '@/lib/email/send-order-cancelled'

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

  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId)

  if (error) return { error: error.message }

  await sendOrderCancelledEmail({
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
  })

  revalidatePath(`/pedido/${order.order_number}`)
  return { success: true }
}
