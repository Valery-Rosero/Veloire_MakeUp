'use client'

import { useState, useTransition } from 'react'
import { toggleProductStatus } from '@/app/admin/productos/actions'

interface Props {
  productId: string
  currentStatus: 'draft' | 'active' | 'inactive'
}

export function ToggleProductStatus({ productId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleToggle() {
    setError(null)
    startTransition(async () => {
      const result = await toggleProductStatus(productId, currentStatus)
      if (result.error) setError('No se pudo cambiar el estado. Inténtalo de nuevo.')
    })
  }

  const label = currentStatus === 'active' ? 'Desactivar' : 'Activar'

  return (
    <span className="inline-flex flex-col items-end">
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="text-xs font-body text-fg-2 hover:text-fg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? '...' : label}
      </button>
      {error && <span role="alert" className="text-[11px] font-body text-error mt-0.5">{error}</span>}
    </span>
  )
}
