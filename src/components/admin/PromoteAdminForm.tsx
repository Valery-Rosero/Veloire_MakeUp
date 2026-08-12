'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { promoteToAdmin } from '@/app/admin/administradores/actions'

export function PromoteAdminForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await promoteToAdmin(email.trim())
      if (result?.error) {
        setError(result.error)
        return
      }
      setSuccess(true)
      setEmail('')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-rim rounded-2xl p-5">
      <p className="font-body text-sm font-medium text-fg mb-3">Dar acceso admin</p>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <Input
            name="email"
            type="email"
            label="Correo de una cuenta ya registrada"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
        >
          {isPending ? <Loader2 size={15} className="animate-spin" /> : 'Hacer admin'}
        </button>
      </div>
      {error && <p className="font-body text-xs text-error mt-3">{error}</p>}
      {success && <p className="font-body text-xs text-success mt-3">✓ Ahora es administrador.</p>}
    </form>
  )
}
