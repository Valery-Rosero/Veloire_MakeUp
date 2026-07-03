'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-guard'

export interface SaveCategoryInput {
  id?: string
  name: string
  slug: string
  description: string
  image_url: string
  face_region: string | null
  is_active: boolean
  sort_order: number
}

export async function saveCategory(data: SaveCategoryInput): Promise<{ error?: string }> {
  await requireAdmin()
  const supabase = await createAdminClient()

  const fields = {
    name: data.name.trim(),
    slug: data.slug.trim(),
    description: data.description.trim() || null,
    image_url: data.image_url.trim() || null,
    face_region: data.face_region || null,
    is_active: data.is_active,
    sort_order: data.sort_order,
  }

  if (data.id) {
    const { error } = await supabase.from('categories').update(fields).eq('id', data.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('categories').insert(fields)
    if (error) return { error: error.message }
  }

  revalidatePath('/admin/categorias')
  revalidatePath('/')
  redirect('/admin/categorias')
}
