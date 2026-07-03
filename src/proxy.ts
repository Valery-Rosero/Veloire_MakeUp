import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

  const { pathname } = request.nextUrl
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p))
  const isProtectedPage = pathname.startsWith('/admin') || pathname.startsWith('/cuenta')

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

  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Usa service role para leer el perfil — la anon key queda bloqueada por RLS
    // si no hay política SELECT explícita en la tabla profiles.
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    )
    const { data: profileRows } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .limit(1)
    const role = (profileRows as Array<{ role: string }> | null)?.[0]?.role
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (pathname.startsWith('/cuenta')) {
    if (!user) {
      const redirectTo = encodeURIComponent(pathname + request.nextUrl.search)
      return NextResponse.redirect(new URL(`/login?redirectTo=${redirectTo}`, request.url))
    }
  }

  if (user && (pathname === '/login' || pathname === '/registro')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
