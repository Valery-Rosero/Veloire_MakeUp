import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { isAdminRole } from '@/lib/roles'
import { cancelOrderAndRestock } from '@/lib/orders'
import { revalidateCatalog } from '@/lib/revalidate-storefront'
import type { OrderStatus } from '@/types/database'

const VALID_STATUSES: OrderStatus[] = [
  'pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled',
]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const status = body?.status as OrderStatus | undefined

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 })
  }

  const [supabase, authClient] = await Promise.all([
    createAdminClient(),
    createClient(),
  ])

  const { data: { user } } = await authClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!isAdminRole(profile?.role)) {
    return NextResponse.json({ error: 'Prohibido.' }, { status: 403 })
  }

  if (status === 'cancelled') {
    const { cancelled, error } = await cancelOrderAndRestock(supabase, id)
    if (error) return NextResponse.json({ error }, { status: 500 })
    if (!cancelled) {
      return NextResponse.json({ error: 'El pedido ya estaba cancelado o entregado.' }, { status: 409 })
    }
    revalidateCatalog()
    return NextResponse.json({ success: true })
  }

  const updateData: { status: OrderStatus; payment_confirmed_at?: string; payment_confirmed_by?: string } = { status }
  if (status === 'paid') {
    updateData.payment_confirmed_at = new Date().toISOString()
    if (user?.id) updateData.payment_confirmed_by = user.id
  }

  const { error } = await supabase.from('orders').update(updateData).eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
