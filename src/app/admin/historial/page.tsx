import { createAdminClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/auth-guard'
import type { Json } from '@/types/database'

interface ActivityRow {
  id: string
  actor_email: string
  action: string
  entity_type: string
  entity_label: string | null
  details: Json | null
  created_at: string
}

const ACTION_LABELS: Record<string, string> = {
  'product.create': 'Creó un producto',
  'product.update': 'Editó un producto',
  'product.delete': 'Eliminó un producto',
  'product.status_toggle': 'Cambió el estado de un producto',
  'category.create': 'Creó una categoría',
  'category.update': 'Editó una categoría',
  'order.create': 'Creó un pedido',
  'order.status_update': 'Cambió el estado de un pedido',
  'order.cancel': 'Canceló un pedido',
  'order.delete': 'Eliminó un pedido',
  'config.update': 'Actualizó la configuración',
  'admin.promote': 'Dio acceso admin',
  'admin.revoke': 'Revocó acceso admin',
}

function formatDetails(details: Json | null): string | null {
  if (!details || typeof details !== 'object' || Array.isArray(details)) return null
  const d = details as Record<string, Json>
  if ('from' in d && 'to' in d) return `${String(d.from)} → ${String(d.to)}`
  if ('key' in d && 'value' in d) return `${String(d.key)} = ${String(d.value)}`
  if ('source' in d) return String(d.source)
  return null
}

export default async function HistorialPage() {
  await requireSuperAdmin()
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('admin_activity_log')
    .select('id, actor_email, action, entity_type, entity_label, details, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const entries = (data as ActivityRow[] | null) ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-fg">Historial de actividad</h1>
        <span className="font-body text-xs text-fg-3">Últimos {entries.length} cambios</span>
      </div>

      <div className="bg-card border border-rim rounded-2xl overflow-hidden">
        {entries.length === 0 ? (
          <p className="text-center font-body text-sm text-fg-3 py-12">Todavía no hay actividad registrada.</p>
        ) : (
          <>
            <div className="hidden sm:grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-5 py-3 bg-alt border-b border-rim">
              <span className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide">Fecha</span>
              <span className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide">Quién</span>
              <span className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide">Acción</span>
              <span className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide">Detalle</span>
            </div>
            <div className="divide-y divide-rim">
              {entries.map((entry) => {
                const detail = formatDetails(entry.details)
                return (
                  <div
                    key={entry.id}
                    className="grid grid-cols-1 sm:grid-cols-[auto_1fr_1fr_auto] items-center gap-1.5 sm:gap-4 px-5 py-3.5"
                  >
                    <span className="font-body text-[11px] text-fg-3 whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleString('es-CO', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                    <span className="font-body text-sm text-fg-2 truncate">{entry.actor_email}</span>
                    <span className="font-body text-sm text-fg truncate">
                      {ACTION_LABELS[entry.action] ?? entry.action}
                      {entry.entity_label && (
                        <span className="text-fg-3"> — {entry.entity_label}</span>
                      )}
                    </span>
                    <span className="font-body text-xs text-fg-3 whitespace-nowrap">{detail ?? ''}</span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
