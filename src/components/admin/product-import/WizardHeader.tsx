import { Check } from 'lucide-react'

const STEPS = [
  { n: 1, label: 'Subir Excel' },
  { n: 2, label: 'Info productos' },
  { n: 3, label: 'Tonos e imágenes' },
  { n: 4, label: 'Publicar' },
] as const

export function WizardHeader({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <div className="w-full py-4 px-4 md:px-0 mb-8">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {STEPS.map((step, i) => {
          const done = step.n < current
          const active = step.n === current
          return (
            <div key={step.n} className="flex items-center flex-1 last:flex-none">
              {/* Circle */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-body font-semibold transition-colors ${
                    done
                      ? 'bg-success text-white'
                      : active
                      ? 'bg-accent text-white'
                      : 'bg-alt border border-rim text-fg-3'
                  }`}
                >
                  {done ? <Check size={14} strokeWidth={2.5} /> : step.n}
                </div>
                <span
                  className={`font-body text-[10px] text-center leading-tight whitespace-nowrap ${
                    active ? 'text-fg font-medium' : done ? 'text-fg-2' : 'text-fg-3'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 mb-5 transition-colors ${
                    done ? 'bg-success/60' : 'bg-rim'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
