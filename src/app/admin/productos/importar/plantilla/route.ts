import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-guard'
import { buildImportTemplate } from '@/lib/product-import/template'

export async function GET() {
  await requireAdmin()
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('categories')
    .select('name, slug')
    .eq('is_active', true)
    .order('sort_order')

  const buffer = await buildImportTemplate(data ?? [])

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="plantilla-veloire.xlsx"',
    },
  })
}
