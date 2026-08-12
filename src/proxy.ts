import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminRole } from '@/lib/roles'

const AUTH_PAGES = ['/login', '/registro', '/recuperar-contrasena', '/nueva-contrasena']

function clearAuthCookies(response: NextResponse, request: NextRequest) {
  request.cookies.getAll().forEach((cookie) => {
    if (cookie.name.startsWith('sb-')) {
      response.cookies.delete(cookie.name)
    }
  })
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  // El rol vive en el JWT (app_metadata) — lo setea la migración/alta de admin
  // en Supabase. Así el middleware nunca tiene que consultar `profiles`.
  const role = user?.app_metadata?.role as string | undefined

  const { pathname } = request.nextUrl
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p))
  const isProtectedPage = pathname.startsWith('/admin') || pathname.startsWith('/cuenta')
  const isApiRoute = pathname.startsWith('/api')

  // If the session is completely invalid (deleted user, revoked token) on a protected route,
  // clear stale cookies and redirect to login.
  if (authError && isProtectedPage) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    clearAuthCookies(response, request)
    return response
  }

  // On public pages, let the request through even with an auth error.
  // Do NOT clear cookies — an authError can be a transient network failure or a
  // brief race during token refresh. Clearing would wipe the refresh token and
  // force the user to log in again unnecessarily.

  // Un admin autenticado vive en /admin — cualquier otra página del sitio
  // (home, /cuenta, catálogo, etc.) lo rebota al panel. No aplica a /api
  // (rompería los fetch del propio panel) ni a las páginas de auth: login y
  // registro se resuelven más abajo, y recuperar/nueva-contraseña deben
  // quedar accesibles siempre, incluso con una sesión de admin activa.
  if (isAdminRole(role) && !pathname.startsWith('/admin') && !isApiRoute && !isAuthPage) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (!isAdminRole(role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Ya validamos sesión + rol acá — se reenvía por header para que
    // admin/layout.tsx no tenga que volver a golpear Supabase.
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-email', user.email ?? '')
    requestHeaders.set('x-user-name', (user.user_metadata?.full_name as string | undefined) ?? '')
    requestHeaders.set('x-user-role', role)
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie))
    return response
  }

  if (pathname.startsWith('/cuenta')) {
    if (!user) {
      const redirectTo = encodeURIComponent(pathname + request.nextUrl.search)
      return NextResponse.redirect(new URL(`/login?redirectTo=${redirectTo}`, request.url))
    }
  }

  if (user && (pathname === '/login' || pathname === '/registro')) {
    return NextResponse.redirect(new URL(role === 'admin' ? '/admin' : '/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
