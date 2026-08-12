import { createAdminClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database'

interface LogAdminActionParams {
  actorId: string
  actorEmail: string
  action: string
  entityType: string
  entityId?: string | null
  entityLabel?: string | null
  details?: Json
}

// Un fallo al escribir el log nunca debe tumbar la mutación real que lo originó.
export async function logAdminAction(params: LogAdminActionParams) {
  try {
    const supabase = await createAdminClient()
    await supabase.from('admin_activity_log').insert({
      actor_id: params.actorId,
      actor_email: params.actorEmail,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId ?? null,
      entity_label: params.entityLabel ?? null,
      details: params.details ?? null,
    })
  } catch {
    // best-effort — no propagar
  }
}
