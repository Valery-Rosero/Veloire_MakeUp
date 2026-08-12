'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-guard'
import { logAdminAction } from '@/lib/audit-log'
import type { WizardProduct } from '@/lib/store/supplier-order'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BulkProductResult {
  nombre: string
  success: boolean
  slug?: string
  error?: string
}

// ─── Action ───────────────────────────────────────────────────────────────────

export async function createProductsInBulk(
  products: WizardProduct[]
): Promise<{ results: BulkProductResult[] }> {
  const admin = await requireAdmin()
  const supabase = await createAdminClient()

  // Fetch all existing slugs once for collision detection
  const { data: existingRows } = await supabase.from('products').select('slug')
  const slugSet = new Set((existingRows ?? []).map((r) => r.slug as string))

  const results: BulkProductResult[] = []

  for (const product of products) {
    try {
      const price = parseFloat(product.precioVenta)
      if (!product.categoryId || isNaN(price) || price <= 0) {
        results.push({ nombre: product.nombre, success: false, error: 'Faltan datos requeridos' })
        continue
      }

      // ── Unique slug ─────────────────────────────────────────────────────────
      const base = slugify(product.nombre)
      let slug = base
      let counter = 2
      while (slugSet.has(slug)) slug = `${base}-${counter++}`
      slugSet.add(slug)

      // ── Insert product ───────────────────────────────────────────────────────
      const { data: productRow, error: productErr } = await supabase
        .from('products')
        .insert({
          name: product.nombre,
          slug,
          description: product.descripcion || null,
          category_id: product.categoryId,
          price,
          cost_price: product.costoUnitario > 0 ? product.costoUnitario : null,
          brand: product.marca || null,
          no_color_variation: product.noColorVariation,
          status: product.publishStatus,
          is_featured: product.isFeatured,
        })
        .select('id')
        .single()

      if (productErr || !productRow) {
        results.push({ nombre: product.nombre, success: false, error: productErr?.message ?? 'Error desconocido' })
        continue
      }

      const productId = productRow.id

      // ── Insert shades ────────────────────────────────────────────────────────
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

      // ── Insert main image ────────────────────────────────────────────────────
      if (product.mainImageUrl) {
        await supabase.from('product_images').insert({
          product_id: productId,
          url: product.mainImageUrl,
          alt_text: product.nombre,
          is_main: true,
          sort_order: 0,
        })
      }

      await logAdminAction({
        actorId: admin.id,
        actorEmail: admin.email,
        action: 'product.create',
        entityType: 'product',
        entityId: productId,
        entityLabel: product.nombre,
        details: { source: 'bulk' },
      })

      results.push({ nombre: product.nombre, success: true, slug })
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
