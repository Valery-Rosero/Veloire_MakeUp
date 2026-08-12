'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-guard'
import { logAdminAction } from '@/lib/audit-log'

export async function updateConfig(key: string, value: string) {
  const admin = await requireAdmin()
  const supabase = await createAdminClient()
  await supabase
    .from('store_config')
    .upsert({ key, value }, { onConflict: 'key' })
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
}
