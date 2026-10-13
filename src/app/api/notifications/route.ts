import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { isAdminRole } from '@/lib/roles'
import type { NotificationType } from '@/types/database'

const VALID_TYPES: NotificationType[] = [
  'order_confirmation',
  'payment_confirmed',
  'order_shipped',
  'order_delivered',
]

export async function POST(request: NextRequest) {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const supabase = await createAdminClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!isAdminRole(profile?.role)) {
    return NextResponse.json({ error: 'Prohibido.' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({}))
  const { orderId, type } = body as { orderId?: string; type?: string }

  if (!orderId || !type) {
    return NextResponse.json({ error: 'orderId y type son requeridos.' }, { status: 400 })
  }

  if (!VALID_TYPES.includes(type as NotificationType)) {
    return NextResponse.json({ error: 'Tipo de notificación inválido.' }, { status: 400 })
  }

  const { data: orderRows } = await supabase
    .from('orders')
    .select('customer_email')
    .eq('id', orderId)
    .limit(1)

  const customerEmail = (orderRows as Array<{ customer_email: string }> | null)?.[0]?.customer_email
  if (!customerEmail) {
    return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 })
  }

  await supabase.from('email_notifications').insert({
    order_id: orderId,
    type: type as NotificationType,
    recipient_email: customerEmail,
    status: 'pending',
  })

  return NextResponse.json({ success: true })
}
