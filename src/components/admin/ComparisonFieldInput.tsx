import { optionsForField, type ComparisonFieldDef } from '@/lib/comparison-fields'

interface Props {
  field: ComparisonFieldDef
  value: string
  onChange: (v: string) => void
  fieldClass: string
  lblClass: string
  disabled?: boolean
}

export function ComparisonFieldInput({ field, value, onChange, fieldClass, lblClass, disabled }: Props) {
  if (field.type === 'text') {
    return (
      <div className="col-span-2">
        <label className={lblClass}>{field.label}</label>
        <textarea
          className={`${fieldClass} resize-none`}
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Ej: Ácido hialurónico, vitamina E"
        />
      </div>
    )
  }

  if (field.type === 'boolean') {
    return (
      <div className="flex items-end pb-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value === 'Sí'}
            onChange={(e) => onChange(e.target.checked ? 'Sí' : 'No')}
            disabled={disabled}
            className="w-4 h-4 rounded border-rim accent-accent"
          />
          <span className="font-body text-sm text-fg">{field.label}</span>
        </label>
      </div>
    )
  }

  return (
    <div>
      <label className={lblClass}>{field.label}</label>
      <select
        className={fieldClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">— Sin especificar —</option>
        {optionsForField(field).map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}
