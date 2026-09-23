import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, name, ...props }, ref) => {
    const inputId = id ?? name
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-body font-medium text-fg-2">
            {label}
          </label>
        )}
        <input
          id={inputId}
          name={name}
          ref={ref}
          className={`w-full min-h-12 rounded-lg border px-3 py-2 text-sm bg-card text-fg outline-none transition-colors duration-150
            placeholder:text-fg-2
            ${error ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20' : 'border-rim hover:border-rim-2 focus:border-accent focus:ring-2 focus:ring-accent/20'}
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
