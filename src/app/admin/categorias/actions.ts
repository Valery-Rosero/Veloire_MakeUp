'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-guard'
import { logAdminAction } from '@/lib/audit-log'
import { slugify, uniqueSlug } from '@/lib/slug'

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

export interface QuickCategoryResult {
  id: string
  name: string
  slug: string
  sku_prefix: string
}

// Creación mínima usada desde el importador de Excel, cuando una hoja no
// coincide con ninguna categoría existente: no redirige (se queda en el
// wizard) y devuelve la categoría creada para que el importador la agregue
// a su lista en memoria y reintente el parseo sin pedir resubir el archivo.
export async function createCategoryQuick(data: {
  name: string
  sku_prefix: string
  face_region: string | null
}): Promise<{ category?: QuickCategoryResult; error?: string }> {
  const admin = await requireAdmin()
  const supabase = await createAdminClient()

  const name = data.name.trim()
  const skuPrefix = data.sku_prefix.trim().toUpperCase()
  if (!name) return { error: 'El nombre es obligatorio.' }
  if (!/^[A-Z]{3}$/.test(skuPrefix)) {
    return { error: 'El prefijo de SKU debe tener exactamente 3 letras (ej. LAB, BAS).' }
  }

  const { data: existing, error: fetchError } = await supabase.from('categories').select('slug, sort_order')
  if (fetchError) return { error: fetchError.message }

  const existingSlugs = new Set((existing ?? []).map((c) => c.slug))
  const slug = uniqueSlug(slugify(name), existingSlugs)
  const sortOrder = (existing ?? []).reduce((max, c) => Math.max(max, c.sort_order ?? 0), 0) + 1

  const fields = {
    name,
    slug,
    sku_prefix: skuPrefix,
    description: null,
    image_url: null,
    face_region: data.face_region || null,
    is_active: true,
    sort_order: sortOrder,
  }

  const { data: rows, error } = await supabase.from('categories').insert(fields).select('id, name, slug, sku_prefix').limit(1)
  if (error) return { error: error.message }

  const category = (rows as QuickCategoryResult[] | null)?.[0]

  await logAdminAction({
    actorId: admin.id,
    actorEmail: admin.email,
    action: 'category.create',
    entityType: 'category',
    entityId: category?.id,
    entityLabel: name,
  })

  revalidatePath('/admin/categorias')
  revalidatePath('/')

  return { category }
}
