import { createAdminClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/auth-guard'
import { PromoteAdminForm } from '@/components/admin/PromoteAdminForm'
import { RevokeAdminButton } from '@/components/admin/RevokeAdminButton'

interface AdminRow {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'superadmin'
}

export default async function AdministradoresPage() {
  const currentAdmin = await requireSuperAdmin()
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .in('role', ['admin', 'superadmin'])
    .order('created_at')

  const admins = (data as AdminRow[] | null) ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-fg">Administradores</h1>
      </div>

      <div className="mb-6">
        <PromoteAdminForm />
      </div>

      <div className="bg-card border border-rim rounded-2xl overflow-hidden">
        {admins.length === 0 ? (
          <p className="text-center font-body text-sm text-fg-3 py-12">No hay administradores.</p>
        ) : (
          <>
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 bg-alt border-b border-rim">
              <span className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide">Cuenta</span>
              <span className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide">Rol</span>
              <span />
            </div>
            <div className="divide-y divide-rim">
              {admins.map((a) => (
                <div
                  key={a.id}
                  className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="font-body text-sm font-medium text-fg truncate">{a.full_name ?? 'Sin nombre'}</p>
                    <p className="font-body text-[11px] text-fg-3 truncate">{a.email}</p>
                  </div>

                  <span
                    className={`hidden sm:inline-flex text-[11px] font-body font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
                      a.role === 'superadmin' ? 'bg-accent/15 text-accent' : 'bg-highlight text-fg-2'
                    }`}
                  >
                    {a.role === 'superadmin' ? 'Superadmin' : 'Admin'}
                  </span>

                  {a.id === currentAdmin.id ? (
                    <span className="text-xs font-body text-fg-3 whitespace-nowrap">Tú</span>
                  ) : (
                    <RevokeAdminButton userId={a.id} label={a.full_name ?? a.email} />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
