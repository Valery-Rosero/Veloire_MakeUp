'use client'

import { useState, type ChangeEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, MailCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from './PasswordInput'
import { PasswordStrength } from './PasswordStrength'

interface FormState {
  name: string
  email: string
  password: string
  confirm: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirm?: string
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {}
  if (form.name.trim().length < 2) errors.name = 'El nombre debe tener al menos 2 caracteres.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Ingresa un correo válido.'
  if (form.password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres.'
  if (form.confirm !== form.password) errors.confirm = 'Las contraseñas no coinciden.'
  return errors
}

export function RegisterForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '', confirm: '' })
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [duplicateEmail, setDuplicateEmail] = useState(false)
  const [sent, setSent] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [termsTouched, setTermsTouched] = useState(false)

  const errors = validate(form)
  const visibleErrors: FormErrors = Object.fromEntries(
    Object.entries(errors).filter(([key]) => touched[key as keyof FormState])
  )

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setServerError(null)
    setDuplicateEmail(false)
  }

  function handleBlur(e: ChangeEvent<HTMLInputElement>) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }

  async function handleSubmit(e: { preventDefault(): void; currentTarget: HTMLFormElement }) {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true, confirm: true })
    setTermsTouched(true)
    if (Object.keys(errors).length > 0 || !acceptedTerms) return

    setLoading(true)
    setServerError(null)
    setDuplicateEmail(false)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        // terms_accepted_at: prueba de la autorización de tratamiento de datos
        // que exige la Ley 1581 de 2012.
        data: { full_name: form.name.trim(), terms_accepted_at: new Date().toISOString() },
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already registered') || error.status === 422) {
        setDuplicateEmail(true)
      } else if (error.status === 429) {
        setServerError('Demasiados intentos. Espera unos minutos antes de intentarlo de nuevo.')
      } else {
        setServerError('Ocurrió un error al crear tu cuenta. Inténtalo más tarde.')
      }
      setLoading(false)
      return
    }

    setRegisteredEmail(form.email)
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
            <MailCheck size={30} className="text-accent" />
          </div>
        </div>

        <h1 className="font-display text-[26px] text-fg leading-snug mb-2">
          Revisa tu correo
        </h1>
        <p className="font-body text-sm text-fg-2 mb-1">
          Te enviamos un correo de verificación a
        </p>
        <p className="font-body text-sm font-medium text-fg mb-6">
          {registeredEmail}
        </p>
        <p className="font-body text-sm text-fg-2 mb-8 leading-relaxed">
          Haz clic en el enlace del correo para activar tu cuenta y luego inicia sesión.
        </p>

        <button
          onClick={() => router.push('/login')}
          className="w-full py-3 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
        >
          Ir a iniciar sesión
        </button>

        <p className="font-body text-xs text-fg-3 mt-4">
          ¿No llegó el correo? Revisa la carpeta de spam.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-[26px] text-fg leading-snug mb-1.5">Crea tu cuenta</h1>
        <p className="font-body text-sm text-fg-2">Únete a Vèloire y disfruta de tus productos favoritos.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          name="name"
          type="text"
          label="Nombre completo"
          placeholder="Tu nombre"
          autoComplete="name"
          required
          value={form.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleErrors.name}
          disabled={loading}
        />

        <Input
          name="email"
          type="email"
          label="Correo electrónico"
          placeholder="tucorreo@ejemplo.com"
          autoComplete="email"
          required
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleErrors.email}
          disabled={loading}
        />

        <div>
          <PasswordInput
            name="password"
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={visibleErrors.password}
            disabled={loading}
          />
          <PasswordStrength password={form.password} />
        </div>

        <PasswordInput
          name="confirm"
          label="Confirmar contraseña"
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
          required
          value={form.confirm}
          onChange={handleChange}
          onBlur={handleBlur}
          error={visibleErrors.confirm}
          disabled={loading}
        />

        <div>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              disabled={loading}
              aria-invalid={termsTouched && !acceptedTerms}
              className="mt-0.5 w-4 h-4 shrink-0 rounded border-rim accent-accent"
            />
            <span className="font-body text-xs text-fg-2 leading-relaxed">
              Acepto los{' '}
              <Link href="/terminos" target="_blank" className="text-accent underline-offset-4 hover:underline">
                Términos y condiciones
              </Link>{' '}
              y autorizo el tratamiento de mis datos según la{' '}
              <Link href="/privacidad" target="_blank" className="text-accent underline-offset-4 hover:underline">
                Política de privacidad
              </Link>
              .
            </span>
          </label>
          {termsTouched && !acceptedTerms && (
            <p className="text-xs text-error mt-1">Debes aceptar para crear tu cuenta.</p>
          )}
        </div>

        {duplicateEmail && (
          <p className="text-sm font-body text-error bg-error/10 px-3 py-2 rounded-lg leading-relaxed">
            Este correo ya tiene una cuenta.{' '}
            <Link href="/login" className="underline underline-offset-4 hover:opacity-80">
              Inicia sesión
            </Link>
            .
          </p>
        )}

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
              Creando cuenta...
            </>
          ) : (
            'Crear cuenta gratis'
          )}
        </button>
      </form>

      <p className="text-center text-[13px] font-body text-fg-2 mt-5">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-accent hover:underline underline-offset-4">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
