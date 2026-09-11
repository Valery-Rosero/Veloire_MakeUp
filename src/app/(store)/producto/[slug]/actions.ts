'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types/database'

const QUALIFYING_STATUSES: OrderStatus[] = ['paid', 'preparing', 'shipped', 'delivered']

export async function submitReview(
  productSlug: string,
  productId: string,
  rating: number,
  comment: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión para dejar una reseña.' }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: 'Selecciona una calificación entre 1 y 5.' }
  }

  // Defensa en profundidad — RLS ya exige esto mismo al insertar.
  const { data: eligible } = await supabase
    .from('order_items')
    .select('order_id, orders!inner(status, customer_email)')
    .eq('product_id', productId)
    .eq('orders.customer_email', user.email!)
    .in('orders.status', QUALIFYING_STATUSES)
    .limit(1)

  if (!eligible || eligible.length === 0) {
    return { error: 'Solo puedes reseñar productos que hayas comprado.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const reviewerName = profile?.full_name?.trim() || user.email!.split('@')[0]

  const { error } = await supabase.from('reviews').upsert(
    {
      product_id: productId,
      user_id: user.id,
      rating,
      comment: comment.trim() || null,
      reviewer_name: reviewerName,
    },
    { onConflict: 'product_id,user_id' }
  )

  if (error) return { error: error.message }

  revalidatePath(`/producto/${productSlug}`)
  return {}
}

export async function deleteReview(productSlug: string, reviewId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  const { error } = await supabase.from('reviews').delete().eq('id', reviewId).eq('user_id', user.id)
  if (error) return { error: error.message }

  revalidatePath(`/producto/${productSlug}`)
  return {}
}
