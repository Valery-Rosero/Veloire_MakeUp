'use client'

import { useState, forwardRef, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, id, name, className = '', ...props }, ref) => {
    const [visible, setVisible] = useState(false)
    const inputId = id ?? name

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-body font-medium text-fg-2">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            name={name}
            ref={ref}
            type={visible ? 'text' : 'password'}
            className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm bg-card text-fg outline-none transition-colors duration-150
              placeholder:text-fg-2
              ${error ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' : 'border-rim hover:border-rim-2 focus:border-accent focus:ring-2 focus:ring-accent/20'}
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={-1}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-2 hover:text-fg transition-colors"
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
