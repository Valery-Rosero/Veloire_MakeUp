'use client'

import { useState, useTransition } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { updateConfig } from '@/app/admin/configuracion/actions'
import { Input } from '@/components/ui/Input'

interface Props {
  config: Record<string, string>
}

interface FieldDef {
  key: string
  label: string
  placeholder: string
  type: string
  validate?: (value: string) => string | null
}

interface SectionDef {
  title: string
  fields: FieldDef[]
}

const SECTIONS: SectionDef[] = [
  {
    title: 'Pago Nequi',
    fields: [
      { key: 'nequi_number', label: 'Número Nequi', placeholder: '3001234567', type: 'text' },
      { key: 'nequi_name', label: 'Nombre en Nequi', placeholder: 'Nombre del titular', type: 'text' },
    ],
  },
  {
    title: 'Envíos',
    fields: [
      {
        key: 'delivery_fee',
        label: 'Costo de domicilio (COP)',
        placeholder: '5000',
        type: 'number',
        validate: (v) => {
          const n = Number(v)
          if (!v.trim()) return 'Ingresa un valor.'
          if (isNaN(n) || n < 0) return 'Debe ser un número positivo.'
          return null
        },
      },
    ],
  },
  {
    title: 'Contacto y redes',
    fields: [
      {
        key: 'store_email',
        label: 'Correo de contacto',
        placeholder: 'hola@veloire.co',
        type: 'email',
        validate: (v) => {
          if (!v.trim()) return null
          const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          return emailRe.test(v) ? null : 'Ingresa un correo válido.'
        },
      },
      {
        key: 'instagram_url',
        label: 'Instagram (URL o @usuario)',
        placeholder: '@veloire',
        type: 'text',
      },
      {
        key: 'whatsapp_number',
        label: 'WhatsApp (número con código de país)',
        placeholder: '573001234567',
        type: 'text',
      },
    ],
  },
]

const ALL_KEYS = SECTIONS.flatMap((s) => s.fields.map((f) => f.key))

export function ConfigForm({ config }: Props) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(ALL_KEYS.map((k) => [k, config[k] ?? '']))
  )
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({})
  const [savedSection, setSavedSection] = useState<string | null>(null)
  const [failedSection, setFailedSection] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function validateSection(fields: FieldDef[]): boolean {
    const errors: Record<string, string | null> = {}
    let valid = true
    for (const field of fields) {
      if (field.validate) {
        const err = field.validate(values[field.key] ?? '')
        errors[field.key] = err
        if (err) valid = false
      }
    }
    setFieldErrors((prev) => ({ ...prev, ...errors }))
    return valid
  }

  function handleSave(e: { preventDefault(): void }, section: SectionDef) {
    e.preventDefault()
    if (!validateSection(section.fields)) return

    setFailedSection(null)
    startTransition(async () => {
      const results = await Promise.all(
        section.fields.map((f) => updateConfig(f.key, values[f.key] ?? ''))
      )
      if (results.some((r) => r.error)) {
        setFailedSection(section.title)
        return
      }
      setSavedSection(section.title)
      setTimeout(() => setSavedSection(null), 2000)
    })
  }

  return (
    <div className="space-y-4">
      {SECTIONS.map((section) => (
        <form
          key={section.title}
          onSubmit={(e) => handleSave(e, section)}
          className="bg-card border border-rim rounded-2xl p-5"
        >
          <p className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide mb-4">
            {section.title}
          </p>
          <div className="space-y-3">
            {section.fields.map((field) => (
              <div key={field.key}>
                <Input
                  name={field.key}
                  type={field.type}
                  label={field.label}
                  placeholder={field.placeholder}
                  value={values[field.key] ?? ''}
                  onChange={(e) => {
                    setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                    if (fieldErrors[field.key]) {
                      setFieldErrors((prev) => ({ ...prev, [field.key]: null }))
                    }
                  }}
                  disabled={isPending}
                />
                {fieldErrors[field.key] && (
                  <p className="font-body text-xs text-error mt-1">{fieldErrors[field.key]}</p>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending && savedSection === null ? (
                <Loader2 size={13} className="animate-spin" />
              ) : null}
              Guardar
            </button>
            {savedSection === section.title && (
              <span className="flex items-center gap-1 text-sm font-body text-success">
                <Check size={13} />
                Guardado
              </span>
            )}
            {failedSection === section.title && (
              <span role="alert" className="text-sm font-body text-error">
                No se pudo guardar. Inténtalo de nuevo.
              </span>
            )}
          </div>
        </form>
      ))}
    </div>
  )
}
