import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

// Usa la SERVICE_ROLE_KEY — bypasea RLS.
// Solo en API routes del servidor, nunca en componentes de cliente.
//
// A propósito NO usa @supabase/ssr ni lee cookies: ese cliente detecta la
// sesión activa del usuario (si hay cookies de auth) y usa el token de esa
// sesión para las peticiones en vez de la service role key — con eso, RLS
// se aplica como el usuario logueado, no como service_role, y esto queda
// bypasseado en apariencia pero no en la práctica. Un cliente sin cookies
// ni manejo de sesión es la única forma de garantizar el bypass real.
export async function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
