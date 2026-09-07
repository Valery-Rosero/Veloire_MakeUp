'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-guard'
import { logAdminAction } from '@/lib/audit-log'

export interface SaveCategoryInput {
  id?: string
  name: string
  slug: string
  sku_prefix: string
  description: string
  image_url: string
  face_region: string | null
  is_active: boolean
  sort_order: number
}

export async function saveCategory(data: SaveCategoryInput): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  const supabase = await createAdminClient()
  const isNew = !data.id

  const fields = {
    name: data.name.trim(),
    slug: data.slug.trim(),
    sku_prefix: data.sku_prefix.trim().toUpperCase(),
    description: data.description.trim() || null,
    image_url: data.image_url.trim() || null,
    face_region: data.face_region || null,
    is_active: data.is_active,
    sort_order: data.sort_order,
  }

  let categoryId = data.id

  if (data.id) {
    const { error } = await supabase.from('categories').update(fields).eq('id', data.id)
    if (error) return { error: error.message }
  } else {
    const { data: rows, error } = await supabase.from('categories').insert(fields).select('id').limit(1)
    if (error) return { error: error.message }
    categoryId = (rows as Array<{ id: string }> | null)?.[0]?.id
  }

  await logAdminAction({
    actorId: admin.id,
    actorEmail: admin.email,
    action: isNew ? 'category.create' : 'category.update',
    entityType: 'category',
    entityId: categoryId,
    entityLabel: fields.name,
  })

  revalidatePath('/admin/categorias')
  revalidatePath('/')
  redirect('/admin/categorias')
}
