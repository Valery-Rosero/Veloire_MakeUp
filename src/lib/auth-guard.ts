import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdminRole, isSuperAdmin } from '@/lib/roles'

export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!isAdminRole(profile?.role)) redirect('/')

  return { id: user.id, email: user.email ?? '' }
}

export async function requireSuperAdmin(): Promise<{ id: string; email: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const adminSupabase = await createAdminClient()
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!isSuperAdmin(profile?.role)) redirect('/admin')

  return { id: user.id, email: user.email ?? '' }
}
