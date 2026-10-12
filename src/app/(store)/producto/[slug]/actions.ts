'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/types/database'
import type { Review } from '@/types/product'

const QUALIFYING_STATUSES: OrderStatus[] = ['paid', 'preparing', 'shipped', 'delivered']

export interface ReviewEligibility {
  isLoggedIn: boolean
  canReview: boolean
  existingReview: Review | null
}

// Depende de la sesión del visitante (cookies), así que no puede vivir en el
// render de la página de producto ahora que esa página es estática + ISR —
// se llama desde el cliente (ReviewsSection) después de montar.
export async function getReviewEligibility(productId: string): Promise<ReviewEligibility> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { isLoggedIn: false, canReview: false, existingReview: null }

    const [{ data: eligible }, { data: existingRows }] = await Promise.all([
      supabase
        .from('order_items')
        .select('order_id, orders!inner(status, customer_email)')
        .eq('product_id', productId)
        .eq('orders.customer_email', user.email!)
        .in('orders.status', QUALIFYING_STATUSES)
        .limit(1),
      supabase
        .from('reviews')
        .select('id, rating, comment, reviewer_name, created_at')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .limit(1),
    ])

    return {
      isLoggedIn: true,
      canReview: (eligible?.length ?? 0) > 0,
      existingReview: (existingRows as Review[] | null)?.[0] ?? null,
    }
  } catch {
    return { isLoggedIn: false, canReview: false, existingReview: null }
  }
}

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
