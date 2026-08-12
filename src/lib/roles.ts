export function isAdminRole(role?: string | null): role is 'admin' | 'superadmin' {
  return role === 'admin' || role === 'superadmin'
}

export function isSuperAdmin(role?: string | null): role is 'superadmin' {
  return role === 'superadmin'
}
