import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'
import { checkoutSchema } from '@/lib/validations/checkout'
import { isRateLimited, getClientIp } from '@/lib/rate-limit'
import { createOrder, PAYMENT_WINDOW } from '@/lib/orders'
import { revalidateCatalog } from '@/lib/revalidate-storefront'

// Del carrito solo se aceptan el tono y la cantidad: precio, nombre e imagen
// los toma create_order de la base de datos, así no se pueden manipular.
const itemsSchema = z
  .array(z.object({ shadeId: z.string().uuid(), quantity: z.number().int().positive() }))
  .min(1)
  .max(50)

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  if (await isRateLimited(ip, 5, 60_000)) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Espera un momento antes de intentarlo de nuevo.' },
      { status: 429 }
    )
  }

  try {
    const { items, ...formData } = await request.json()

    const parsed = checkoutSchema.safeParse(formData)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const parsedItems = itemsSchema.safeParse(items)
    if (!parsedItems.success) {
      return NextResponse.json({ error: 'El carrito está vacío o es inválido' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const result = await createOrder(supabase, {
      ...parsed.data,
      items: parsedItems.data,
      expiresIn: PAYMENT_WINDOW,
    })

    if (!result.ok) {
      if (result.reason === 'stock_insuficiente') {
        return NextResponse.json(
          {
            error: 'stock_insuficiente',
            productName: result.productName,
            shadeName: result.shadeName,
            available: result.available,
          },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: result.message },
        { status: result.reason === 'invalid' ? 400 : 500 }
      )
    }

    revalidateCatalog()
    return NextResponse.json({ orderNumber: result.orderNumber }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}
