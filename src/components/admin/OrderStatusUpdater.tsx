'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { updateOrderStatus } from '@/app/admin/pedidos/actions'
import type { OrderStatus } from '@/types/database'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Pago pendiente',
  paid: 'Confirmar pago',
  preparing: 'En preparación',
  shipped: 'Marcar enviado',
  delivered: 'Marcar entregado',
  cancelled: 'Cancelar',
}

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['paid'],
  paid: ['preparing'],
  preparing: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

const BUTTON_STYLES: Partial<Record<OrderStatus, string>> = {
  cancelled: 'border border-error text-error hover:bg-error/10',
}

interface Props {
  orderId: string
  currentStatus: OrderStatus
}

export function OrderStatusUpdater({ orderId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const nextStatuses = NEXT_STATUSES[currentStatus]

  if (nextStatuses.length === 0) return null

  function handleUpdate(status: OrderStatus) {
    setError(null)
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status)
      if (result.error) setError(`No se pudo actualizar el pedido: ${result.error}`)
    })
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <button
            key={status}
            onClick={() => handleUpdate(status)}
            disabled={isPending}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-body font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              BUTTON_STYLES[status] ??
              'bg-noir text-beige hover:opacity-90'
            }`}
          >
            {isPending && <Loader2 size={13} className="animate-spin" />}
            {STATUS_LABELS[status]}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm font-body text-error bg-error/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
    </div>
  )
}
