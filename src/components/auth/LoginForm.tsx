'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from './PasswordInput'
import { isAdminRole } from '@/lib/roles'

const MAX_ATTEMPTS = 5

interface LoginFormProps {
  redirectTo: string
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)

  const tooManyAttempts = attempts >= MAX_ATTEMPTS

  async function handleSubmit(e: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    e.preventDefault()
    if (tooManyAttempts) return

    const fd = new FormData(e.currentTarget)
    const email = fd.get('email') as string
    const password = fd.get('password') as string

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError, data } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      const next = attempts + 1
      setAttempts(next)
      setError(
        next >= MAX_ATTEMPTS
          ? 'Demasiados intentos. Espera unos minutos antes de intentarlo de nuevo.'
          : 'Correo o contraseña incorrectos. Inténtalo de nuevo.'
      )
      setLoading(false)
      return
    }

    // El rol viene en el JWT (app_metadata) — no hace falta consultar profiles.
    const role = data.user.app_metadata?.role as string | undefined

    // replace() elimina /login del historial y fuerza carga limpia con cookies de sesión activas.
    window.location.replace(isAdminRole(role) ? '/admin' : redirectTo)
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-[26px] text-fg leading-snug mb-1.5">
          Bienvenida de nuevo
        </h1>
        <p className="font-body text-sm text-fg-2">Inicia sesión para continuar en Vèloire.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          name="email"
          type="email"
          label="Correo electrónico"
          placeholder="tucorreo@ejemplo.com"
          autoComplete="email"
          required
          disabled={loading || tooManyAttempts}
        />

        <div className="space-y-1">
          <PasswordInput
            name="password"
            label="Contraseña"
            placeholder="Tu contraseña"
            autoComplete="current-password"
            required
            disabled={loading || tooManyAttempts}
          />
          <div className="flex justify-end">
            <Link
              href="/recuperar-contrasena"
              className="text-xs font-body text-accent hover:underline underline-offset-4"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        {error && (
          <p className="text-sm font-body text-error bg-error/10 px-3 py-2 rounded-lg leading-relaxed">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || tooManyAttempts}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Ingresando...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </form>

      <p className="text-center text-[13px] font-body text-fg-2 mt-5">
        ¿No tienes cuenta?{' '}
        <Link href="/registro" className="text-accent hover:underline underline-offset-4">
          Regístrate gratis
        </Link>
      </p>
    </div>
  )
}
