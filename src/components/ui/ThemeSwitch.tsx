'use client'

import { useId } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/components/ui/ThemeProvider'

const OPTIONS = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Auto', icon: Monitor },
] as const

/**
 * Selector Claro · Oscuro · Auto ("Auto" sigue el modo del dispositivo).
 * La opción elegida tiene una tarjetita que se desliza entre opciones; el
 * layoutId lleva useId() porque puede haber varios selectores montados a la vez.
 */
export function ThemeSwitch({ label = 'Tema' }: { label?: string }) {
  const { theme, setTheme } = useTheme()
  const uid = useId()
  return (
    <div>
      <p className="mb-2 font-body text-[10px] font-semibold uppercase tracking-[0.16em] text-fg-3">{label}</p>
      <div role="radiogroup" aria-label={label} className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-alt">
        {OPTIONS.map(({ value, label: text, icon: Icon }) => {
          const selected = theme === value
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setTheme(value)}
              className={`relative flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-body font-medium transition-colors ${
                selected ? 'text-fg' : 'text-fg-3 hover:text-fg-2'
              }`}
            >
              {selected && (
                <motion.span
                  layoutId={`${uid}-thumb`}
                  className="absolute inset-0 rounded-lg bg-card shadow-sm border border-rim"
                  transition={{ type: 'spring', stiffness: 460, damping: 36 }}
                  aria-hidden
                />
              )}
              <Icon size={13} strokeWidth={1.8} className={`relative ${selected ? 'text-accent' : ''}`} />
              <span className="relative">{text}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
