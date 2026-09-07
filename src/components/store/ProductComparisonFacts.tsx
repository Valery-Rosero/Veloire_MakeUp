import { getFieldsForCategory } from '@/lib/comparison-fields'

interface Props {
  categorySlug: string
  comparison: Record<string, string> | null
}

export function ProductComparisonFacts({ categorySlug, comparison }: Props) {
  if (!comparison) return null

  const fields = getFieldsForCategory(categorySlug).filter((f) => comparison[f.key])
  if (fields.length === 0) return null

  return (
    <>
      <hr className="border-rim" />
      <div>
        <p className="text-sm font-body font-medium text-fg mb-2.5">Ficha técnica</p>
        <dl className="space-y-1.5">
          {fields.map((f) => (
            <div key={f.key} className="flex items-baseline justify-between gap-4 text-sm font-body">
              <dt className="text-fg-3">{f.label}</dt>
              <dd className="text-fg-2 text-right">{comparison[f.key]}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  )
}
