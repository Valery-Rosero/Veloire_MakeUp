'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/auth-guard'
import { logAdminAction } from '@/lib/audit-log'
import { isAdminRole } from '@/lib/roles'

export async function promoteToAdmin(email: string): Promise<{ error?: string }> {
  const admin = await requireSuperAdmin()
  const supabase = await createAdminClient()

  const normalizedEmail = email.trim().toLowerCase()
  const { data: profileRows } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .ilike('email', normalizedEmail)
    .limit(1)

  const target = (profileRows as Array<{ id: string; email: string; full_name: string | null; role: string }> | null)?.[0]
  if (!target) return { error: 'No existe ninguna cuenta registrada con ese correo.' }
  if (isAdminRole(target.role)) return { error: 'Este usuario ya es administrador.' }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', target.id)
  if (profileError) return { error: profileError.message }

  const { data: userData } = await supabase.auth.admin.getUserById(target.id)
  await supabase.auth.admin.updateUserById(target.id, {
    app_metadata: { ...userData?.user?.app_metadata, role: 'admin' },
  })

  await logAdminAction({
    actorId: admin.id,
    actorEmail: admin.email,
    action: 'admin.promote',
    entityType: 'profile',
    entityId: target.id,
    entityLabel: target.full_name ?? target.email,
  })

  revalidatePath('/admin/administradores')
  return {}
}

export async function revokeAdmin(userId: string): Promise<{ error?: string }> {
  const admin = await requireSuperAdmin()
  const supabase = await createAdminClient()

  if (userId === admin.id) return { error: 'No puedes revocarte el acceso a ti misma.' }

  const { data: target } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', userId)
    .single()

  if (!target) return { error: 'Usuario no encontrado.' }

  if (target.role === 'superadmin') {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'superadmin')
    if ((count ?? 0) <= 1) return { error: 'No puedes revocar al único superadmin.' }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'customer' })
    .eq('id', userId)
  if (profileError) return { error: profileError.message }

  const { data: userData } = await supabase.auth.admin.getUserById(userId)
  await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { ...userData?.user?.app_metadata, role: 'customer' },
  })

  await logAdminAction({
    actorId: admin.id,
    actorEmail: admin.email,
    action: 'admin.revoke',
    entityType: 'profile',
    entityId: target.id,
    entityLabel: target.full_name ?? target.email,
  })

  revalidatePath('/admin/administradores')
  return {}
}
