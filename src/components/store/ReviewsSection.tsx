'use client'

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { StarRating } from './StarRating'
import { submitReview, deleteReview } from '@/app/(store)/producto/[slug]/actions'
import { formatDate } from '@/lib/format'
import type { Review } from '@/types/product'

interface Props {
  productSlug: string
  productId: string
  reviews: Review[]
  isLoggedIn: boolean
  canReview: boolean
  existingReview: Review | null
}

export function ReviewsSection({ productSlug, productId, reviews, isLoggedIn, canReview, existingReview }: Props) {
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(existingReview?.rating ?? 0)
  const [comment, setComment] = useState(existingReview?.comment ?? '')
  const [error, setError] = useState<string | null>(null)

  const average = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  function handleSubmit() {
    if (rating < 1) {
      setError('Selecciona una calificación.')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await submitReview(productSlug, productId, rating, comment)
      if (result?.error) setError(result.error)
      else setShowForm(false)
    })
  }

  function handleDelete() {
    if (!existingReview) return
    startTransition(async () => {
      await deleteReview(productSlug, existingReview.id)
      setRating(0)
      setComment('')
      setShowForm(false)
    })
  }

  return (
    <div>
      <div className="flex items-start gap-4 mb-8">
        <div className="w-0.5 h-8 bg-accent mt-1 shrink-0" />
        <div>
          <h2 className="font-display text-2xl text-fg">Reseñas</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <StarRating value={average} />
              <span className="font-body text-sm text-fg-2">
                {average.toFixed(1)} · {reviews.length} reseña{reviews.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {canReview && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 px-5 py-2.5 rounded-xl border border-rim text-sm font-body font-medium text-fg-2 hover:bg-alt transition-colors"
        >
          {existingReview ? 'Editar tu reseña' : 'Escribir una reseña'}
        </button>
      )}

      {canReview && showForm && (
        <div className="bg-card border border-rim rounded-2xl p-5 mb-6 space-y-3 max-w-lg">
          <StarRating value={rating} onChange={setRating} size={24} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Cuéntale a otras clientas qué te pareció (opcional)"
            className="w-full rounded-xl border border-rim px-3 py-2 text-sm bg-page text-fg outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
          />
          {error && <p className="font-body text-xs text-error">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : 'Publicar reseña'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              disabled={isPending}
              className="px-4 py-2.5 text-sm font-body text-fg-2 hover:text-fg transition-colors"
            >
              Cancelar
            </button>
            {existingReview && (
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="ml-auto flex items-center gap-1.5 text-sm font-body text-error hover:opacity-80 transition-opacity"
              >
                <Trash2 size={14} />
                Eliminar
              </button>
            )}
          </div>
        </div>
      )}

      {isLoggedIn && !canReview && (
        <p className="font-body text-sm text-fg-3 mb-6">
          Solo las clientas que compraron este producto pueden dejar una reseña.
        </p>
      )}

      {reviews.length === 0 ? (
        <p className="font-body text-sm text-fg-3">Todavía no hay reseñas de este producto.</p>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-rim pb-4 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-body text-sm font-medium text-fg">{r.reviewer_name}</span>
                <span className="font-body text-xs text-fg-3">{formatDate(r.created_at)}</span>
              </div>
              <StarRating value={r.rating} size={14} />
              {r.comment && (
                <p className="font-body text-sm text-fg-2 mt-2 leading-relaxed">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
