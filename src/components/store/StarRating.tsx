'use client'

import { Star } from 'lucide-react'

interface Props {
  value: number
  onChange?: (value: number) => void
  size?: number
}

export function StarRating({ value, onChange, size = 16 }: Props) {
  const interactive = !!onChange
  const rounded = Math.round(value)

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          aria-label={`${n} estrella${n !== 1 ? 's' : ''}`}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            size={size}
            className={n <= rounded ? 'text-gold fill-current' : 'text-fg-3'}
          />
        </button>
      ))}
    </div>
  )
}
