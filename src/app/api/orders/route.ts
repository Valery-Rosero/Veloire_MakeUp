import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkoutSchema } from '@/lib/validations/checkout'
import { isRateLimited, getClientIp } from '@/lib/rate-limit'
import type { CartItem } from '@/lib/store/cart'

interface OrderBody extends Record<string, unknown> {
  items: CartItem[]
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  if (await isRateLimited(ip, 5, 60_000)) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Espera un momento antes de intentarlo de nuevo.' },
      { status: 429 }
    )
  }

  try {
    const body: OrderBody = await request.json()
    const { items, ...formData } = body

    const parsed = checkoutSchema.safeParse(formData)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })
    }

    const data = parsed.data
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)

    const supabase = await createAdminClient()

    // ── Validar y descontar stock ──────────────────────────────────────────────

    const shadeIds = items.map((i) => i.shadeId).filter(Boolean)

    const { data: shades, error: shadesError } = await supabase
      .from('product_shades')
      .select('id, stock, name')
      .in('id', shadeIds)

    if (shadesError) throw shadesError

    const stockMap = new Map((shades ?? []).map((s) => [s.id, s.stock]))

    // Verificar disponibilidad antes de crear nada
    for (const item of items) {
      const available = stockMap.get(item.shadeId) ?? 0
      if (available < item.quantity) {
        return NextResponse.json(
          {
            error: 'stock_insuficiente',
            productName: item.productName,
            shadeName: item.shadeName,
            available,
          },
          { status: 409 }
        )
      }
    }

    // ── Delivery fee ──────────────────────────────────────────────────────────

    const { data: feeRows } = await supabase
      .from('store_config')
      .select('value')
      .eq('key', 'delivery_fee')
      .limit(1)
    const delivery_fee = parseInt(
      (feeRows as Array<{ value: string }> | null)?.[0]?.value ?? '5000',
      10
    )

    const totalAmount = subtotal + delivery_fee

    // ── Crear pedido ──────────────────────────────────────────────────────────

    const { data: orderNumberData, error: rpcError } = await supabase.rpc('generate_order_number')
    if (rpcError) throw rpcError
    const orderNumber: string = orderNumberData

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderInsert: any = {
      order_number: orderNumber,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      address: data.address,
      neighborhood: data.neighborhood,
      city: data.city,
      department: data.department,
      notes: data.notes ?? null,
      payment_method: data.payment_method,
      subtotal,
      delivery_fee,
      total: totalAmount,
      status: 'pending_payment',
    }

    const { data: orderRows, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsert)
      .select('id')

    if (orderError) throw orderError

    const orderId = (orderRows as Array<{ id: string }> | null)?.[0]?.id
    if (!orderId) throw new Error('No se pudo obtener el ID del pedido')

    // ── Insertar items ────────────────────────────────────────────────────────

    const orderItems = items.map((item) => ({
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

    const { error: itemsError } = await supabase
      .from('order_items')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(orderItems as any)
    if (itemsError) throw itemsError

    // ── Descontar stock (después de confirmar el pedido creado) ───────────────

    await Promise.all(
      items.map(async (item) => {
        if (!item.shadeId) return
        const current = stockMap.get(item.shadeId) ?? 0
        await supabase
          .from('product_shades')
          .update({ stock: current - item.quantity })
          .eq('id', item.shadeId)
      })
    )

    return NextResponse.json({ orderNumber }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}
