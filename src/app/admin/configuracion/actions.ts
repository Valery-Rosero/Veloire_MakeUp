'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-guard'
import { logAdminAction } from '@/lib/audit-log'

export async function updateConfig(key: string, value: string): Promise<{ error?: string }> {
  const admin = await requireAdmin()
  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('store_config')
    .upsert({ key, value }, { onConflict: 'key' })
  if (error) return { error: error.message }

  await logAdminAction({
    actorId: admin.id,
    actorEmail: admin.email,
    action: 'config.update',
    entityType: 'store_config',
    entityId: key,
    entityLabel: key,
    details: { key, value },
  })
  revalidatePath('/admin/configuracion')
  // El footer, el botón de WhatsApp y el costo de domicilio salen de esta tabla
  // y el layout de la tienda está en caché: se refresca todo el sitio.
  revalidatePath('/', 'layout')
  return {}
}
