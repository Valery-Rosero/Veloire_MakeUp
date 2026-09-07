'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-guard'
import { logAdminAction } from '@/lib/audit-log'
import { slugify, uniqueSlug } from '@/lib/slug'
import type { ImportProduct } from '@/lib/store/product-import'

export interface ImportResult {
  nombre: string
  success: boolean
  isExisting?: boolean
  error?: string
}

export async function getExistingSkus(): Promise<string[]> {
  await requireAdmin()
  const supabase = await createAdminClient()
  const { data } = await supabase.from('products').select('sku')
  return (data as Array<{ sku: string }> | null)?.map((r) => r.sku) ?? []
}

export async function upsertProductsFromImport(
  products: ImportProduct[]
): Promise<{ results: ImportResult[] }> {
  const admin = await requireAdmin()
  const supabase = await createAdminClient()

  const { data: existingSlugRows } = await supabase.from('products').select('slug')
  const slugSet = new Set((existingSlugRows ?? []).map((r) => r.slug as string))

  const results: ImportResult[] = []

  for (const product of products) {
    try {
      const price = parseFloat(product.precioVenta)
      if (isNaN(price) || price <= 0) {
        results.push({ nombre: product.nombre, success: false, error: 'Falta el precio de venta' })
        continue
      }

      let productId: string

      if (product.isExisting) {
        const { data: row, error } = await supabase
          .from('products')
          .update({
            name: product.nombre,
            description: product.descripcion || null,
            price,
            cost_price: product.costoUnitario > 0 ? product.costoUnitario : null,
            brand: product.marca || null,
            no_color_variation: product.noColorVariation,
            status: product.publishStatus,
            is_featured: product.isFeatured,
            comparison: product.comparison,
          })
          .eq('sku', product.sku)
          .select('id')
          .single()

        if (error || !row) {
          results.push({ nombre: product.nombre, success: false, error: error?.message ?? 'No se encontró el producto a actualizar' })
          continue
        }
        productId = row.id

        // Tonos: actualiza los que ya existen (por excel_ref), inserta los nuevos,
        // nunca borra los ausentes del lote (un reabastecimiento parcial no elimina tonos).
        const { data: existingShades } = await supabase
          .from('product_shades')
          .select('id, excel_ref')
          .eq('product_id', productId)
        const shadeMap = new Map(
          (existingShades as Array<{ id: string; excel_ref: string | null }> | null ?? [])
            .filter((s) => s.excel_ref)
            .map((s) => [s.excel_ref as string, s.id])
        )

        for (const shade of product.shades) {
          const shadeFields = {
            name: shade.name.trim() || shade.excelRef,
            hex_color: shade.hexColor || '#C8C8C8',
            image_url: shade.imageUrl || null,
            stock: shade.stock,
            is_active: shade.stock > 0,
          }
          const existingId = shadeMap.get(shade.excelRef)
          if (existingId) {
            await supabase.from('product_shades').update(shadeFields).eq('id', existingId)
          } else {
            await supabase.from('product_shades').insert({
              product_id: productId,
              excel_ref: shade.excelRef || null,
              sort_order: product.shades.indexOf(shade),
              ...shadeFields,
            })
          }
        }

        if (product.mainImageUrl) {
          await supabase.from('product_images').update({ is_main: false }).eq('product_id', productId)
          await supabase.from('product_images').insert({
            product_id: productId,
            url: product.mainImageUrl,
            alt_text: product.nombre,
            is_main: true,
            sort_order: 0,
          })
        }
      } else {
        const base = slugify(product.nombre)
        const slug = uniqueSlug(base, slugSet)

        const { data: rows, error } = await supabase
          .from('products')
          .insert({
            name: product.nombre,
            slug,
            sku: product.sku,
            description: product.descripcion || null,
            category_id: product.categoryId,
            price,
            cost_price: product.costoUnitario > 0 ? product.costoUnitario : null,
            brand: product.marca || null,
            no_color_variation: product.noColorVariation,
            status: product.publishStatus,
            is_featured: product.isFeatured,
            comparison: product.comparison,
          })
          .select('id')
          .single()

        if (error || !rows) {
          results.push({ nombre: product.nombre, success: false, error: error?.message ?? 'Error desconocido' })
          continue
        }
        productId = rows.id

        if (product.shades.length > 0) {
          const { error: shadesErr } = await supabase.from('product_shades').insert(
            product.shades.map((s, i) => ({
              product_id: productId,
              name: s.name.trim() || s.excelRef,
              excel_ref: s.excelRef || null,
              hex_color: s.hexColor || '#C8C8C8',
              image_url: s.imageUrl || null,
              stock: s.stock,
              is_active: s.stock > 0,
              sort_order: i,
            }))
          )
          if (shadesErr) {
            results.push({ nombre: product.nombre, success: false, error: shadesErr.message })
            continue
          }
        }

        if (product.mainImageUrl) {
          await supabase.from('product_images').insert({
            product_id: productId,
            url: product.mainImageUrl,
            alt_text: product.nombre,
            is_main: true,
            sort_order: 0,
          })
        }
      }

      await logAdminAction({
        actorId: admin.id,
        actorEmail: admin.email,
        action: product.isExisting ? 'product.import_update' : 'product.import_create',
        entityType: 'product',
        entityId: productId,
        entityLabel: product.nombre,
        details: { sku: product.sku },
      })

      results.push({ nombre: product.nombre, success: true, isExisting: product.isExisting })
    } catch (err) {
      results.push({
        nombre: product.nombre,
        success: false,
        error: err instanceof Error ? err.message : 'Error desconocido',
      })
    }
  }

  revalidatePath('/admin/productos')
  return { results }
}
