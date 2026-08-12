'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-guard'
import { logAdminAction } from '@/lib/audit-log'

interface ShadeInput {
  id?: string
  name: string
  hex_color: string
  stock: number
  image_url: string
  is_active: boolean
  sort_order: number
}

interface ImageInput {
  url: string
  alt_text: string
  is_main: boolean
  sort_order: number
}

export interface SaveProductInput {
  id?: string
  category_id: string
  name: string
  slug: string
  description: string
  price: number
  compare_price: number | null
  status: 'draft' | 'active' | 'inactive'
  is_featured: boolean
  meta_title: string
  meta_description: string
  shades: ShadeInput[]
  removedShadeIds: string[]
  images: ImageInput[]
}

export async function saveProduct(data: SaveProductInput): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  const supabase = await createAdminClient()
  const isNew = !data.id

  const productFields = {
    category_id: data.category_id,
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    price: data.price,
    compare_price: data.compare_price,
    status: data.status,
    is_featured: data.is_featured,
    meta_title: data.meta_title || null,
    meta_description: data.meta_description || null,
  }

  let productId = data.id

  if (data.id) {
    const { error } = await supabase.from('products').update(productFields).eq('id', data.id)
    if (error) return { error: error.message }
  } else {
    const { data: rows, error } = await supabase
      .from('products')
      .insert(productFields)
      .select('id')
      .limit(1)
    if (error) return { error: error.message }
    productId = (rows as Array<{ id: string }> | null)?.[0]?.id
    if (!productId) return { error: 'Error al crear el producto.' }
  }

  // Shades: mark removed as inactive, upsert existing, insert new
  if (data.removedShadeIds.length > 0) {
    await supabase
      .from('product_shades')
      .update({ is_active: false, stock: 0 })
      .in('id', data.removedShadeIds)
  }

  const existingShades = data.shades.filter((s) => s.id)
  const newShades = data.shades.filter((s) => !s.id)

  if (existingShades.length > 0) {
    await supabase.from('product_shades').upsert(
      existingShades.map((s) => ({
        id: s.id!,
        product_id: productId!,
        name: s.name,
        hex_color: s.hex_color,
        stock: s.stock,
        image_url: s.image_url || null,
        is_active: s.is_active,
        sort_order: s.sort_order,
      }))
    )
  }

  if (newShades.length > 0) {
    await supabase.from('product_shades').insert(
      newShades.map((s, i) => ({
        product_id: productId!,
        name: s.name,
        hex_color: s.hex_color,
        stock: s.stock,
        image_url: s.image_url || null,
        is_active: s.is_active,
        sort_order: s.sort_order || existingShades.length + i,
      }))
    )
  }

  // Images: nuke and re-insert (no FK dependencies)
  await supabase.from('product_images').delete().eq('product_id', productId!)
  if (data.images.length > 0) {
    await supabase.from('product_images').insert(
      data.images.map((img) => ({
        product_id: productId!,
        url: img.url,
        alt_text: img.alt_text || null,
        is_main: img.is_main,
        sort_order: img.sort_order,
      }))
    )
  }

  await logAdminAction({
    actorId: admin.id,
    actorEmail: admin.email,
    action: isNew ? 'product.create' : 'product.update',
    entityType: 'product',
    entityId: productId,
    entityLabel: data.name,
  })

  revalidatePath('/admin/productos')
  if (productId) revalidatePath(`/admin/productos/${productId}/editar`)
  redirect('/admin/productos')
  // redirect() throws — unreachable, but satisfies return type
}

export async function deleteProduct(productId: string): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  const supabase = await createAdminClient()

  const { data: productRow } = await supabase
    .from('products')
    .select('name')
    .eq('id', productId)
    .single()

  // Check for active (non-terminal) orders that include this product
  const { data: orderItemRows } = await supabase
    .from('order_items')
    .select('order_id')
    .eq('product_id', productId)

  const orderIds = (orderItemRows as Array<{ order_id: string }> | null)?.map((r) => r.order_id) ?? []

  if (orderIds.length > 0) {
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('id', orderIds)
      .in('status', ['pending_payment', 'paid', 'preparing', 'shipped'])

    if (count && count > 0) return { error: 'ACTIVE_ORDERS' }
  }

  await supabase.from('product_shades').delete().eq('product_id', productId)
  await supabase.from('product_images').delete().eq('product_id', productId)
  const { error } = await supabase.from('products').delete().eq('id', productId)

  if (error) return { error: error.message }

  await logAdminAction({
    actorId: admin.id,
    actorEmail: admin.email,
    action: 'product.delete',
    entityType: 'product',
    entityId: productId,
    entityLabel: (productRow as { name: string } | null)?.name ?? null,
  })

  revalidatePath('/admin/productos')
  return {}
}

export async function toggleProductStatus(
  productId: string,
  currentStatus: 'draft' | 'active' | 'inactive'
) {
  const admin = await requireAdmin()
  const supabase = await createAdminClient()
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  await supabase.from('products').update({ status: newStatus }).eq('id', productId)
  await logAdminAction({
    actorId: admin.id,
    actorEmail: admin.email,
    action: 'product.status_toggle',
    entityType: 'product',
    entityId: productId,
    details: { from: currentStatus, to: newStatus },
  })
  revalidatePath('/admin/productos')
}
