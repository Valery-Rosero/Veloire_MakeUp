'use client'

import { useState, useEffect, type FormEvent } from 'react'
import Link from 'next/link'
import { Loader2, MailCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'

const RESEND_COOLDOWN = 60

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [secondsLeft])

  async function send() {
    setLoading(true)
    setServerError(null)
    const { error } = await createClient()
      .auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/nueva-contrasena`,
      })
      .catch(() => ({ error: { status: 0 } }))
    setLoading(false)

    if (error) {
      setServerError(
        error.status === 429
          ? 'Demasiados intentos. Espera unos minutos antes de pedir otro enlace.'
          : 'No pudimos enviar el correo. Revisa tu conexión e inténtalo de nuevo.'
      )
      return
    }

    setSent(true)
    setSecondsLeft(RESEND_COOLDOWN)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Ingresa un correo válido.')
      return
    }
    setEmailError(null)
    await send()
  }

  async function handleResend() {
    if (secondsLeft > 0) return
    await send()
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
            <MailCheck size={26} className="text-accent" />
          </div>
        </div>
        <h1 className="font-display text-[26px] text-fg leading-snug mb-2">Revisa tu correo</h1>
        <p className="font-body text-sm text-fg-2 leading-relaxed mb-6">
          Enviamos un enlace a <span className="font-medium text-fg">{email}</span>. Ábrelo para crear una nueva contraseña.
        </p>
        <p className="font-body text-sm text-fg-2">
          ¿No llegó?{' '}
          {secondsLeft > 0 ? (
            <span className="text-fg-3">Reenviar en {secondsLeft}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-accent hover:underline underline-offset-4 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Reenviar correo'}
            </button>
          )}
        </p>
        {serverError && <p className="font-body text-xs text-error mt-3">{serverError}</p>}
        <div className="mt-8">
          <Link
            href="/login"
            className="text-[13px] font-body text-fg-2 hover:text-fg transition-colors"
          >
            ← Volver a iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-[26px] text-fg leading-snug mb-1.5">
          Recupera tu contraseña
        </h1>
        <p className="font-body text-sm text-fg-2 leading-relaxed">
          Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          name="email"
          type="email"
          label="Correo electrónico"
          placeholder="tucorreo@ejemplo.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailError(null) }}
          onBlur={() => {
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              setEmailError('Ingresa un correo válido.')
            }
          }}
          error={emailError ?? undefined}
          disabled={loading}
        />

        {serverError && (
          <p className="text-sm font-body text-error bg-error/10 px-3 py-2 rounded-lg leading-relaxed">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar enlace'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-[13px] font-body text-fg-2 hover:text-fg transition-colors"
        >
          ← Volver a iniciar sesión
        </Link>
      </div>
    </div>
  )
}
