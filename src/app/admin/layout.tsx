import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { AdminLayoutShell } from '@/components/admin/AdminLayoutShell'
import { isAdminRole } from '@/lib/roles'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // src/proxy.ts ya validó sesión + rol admin para todo lo que matchea /admin
  // y reenvía la identidad por header — evita repetir el round-trip a Supabase acá.
  const headerList = await headers()
  const userRole = headerList.get('x-user-role')

  if (!isAdminRole(userRole)) redirect('/login?redirectTo=/admin')

  return (
    <AdminLayoutShell
      userEmail={headerList.get('x-user-email') ?? ''}
      userName={headerList.get('x-user-name') || null}
      userRole={userRole}
    >
      {children}
    </AdminLayoutShell>
  )
}
