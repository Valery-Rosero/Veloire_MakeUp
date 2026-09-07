'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { saveCategory, type SaveCategoryInput } from '@/app/admin/categorias/actions'
import { Input } from '@/components/ui/Input'
import { FACE_REGIONS } from '@/lib/face-regions'
import { slugify } from '@/lib/format'

interface InitialData {
  id: string
  name: string
  slug: string
  sku_prefix: string
  description: string
  image_url: string
  face_region: string | null
  is_active: boolean
  sort_order: number
}

function suggestSkuPrefix(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z]/g, '')
    .toUpperCase()
    .slice(0, 3)
}

interface Props {
  initialData?: InitialData
}

export function CategoryForm({ initialData }: Props) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const [name, setName] = useState(initialData?.name ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [slugManual, setSlugManual] = useState(!!initialData)
  const [skuPrefix, setSkuPrefix] = useState(initialData?.sku_prefix ?? '')
  const [skuPrefixManual, setSkuPrefixManual] = useState(!!initialData)
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [imageUrl, setImageUrl] = useState(initialData?.image_url ?? '')
  const [faceRegion, setFaceRegion] = useState(initialData?.face_region ?? '')
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true)
  const [sortOrder, setSortOrder] = useState(String(initialData?.sort_order ?? 0))

  function handleNameChange(value: string) {
    setName(value)
    if (!slugManual) setSlug(slugify(value))
    if (!skuPrefixManual) setSkuPrefix(suggestSkuPrefix(value))
  }

  function handleSubmit() {
    if (!name.trim() || !slug.trim()) {
      setServerError('El nombre y el slug son obligatorios.')
      return
    }
    if (!/^[A-Z]{3}$/.test(skuPrefix)) {
      setServerError('El prefijo de SKU debe tener exactamente 3 letras (ej. LAB, BAS).')
      return
    }
    setServerError(null)
    const input: SaveCategoryInput = {
      id: initialData?.id,
      name: name.trim(),
      slug: slug.trim(),
      sku_prefix: skuPrefix,
      description: description.trim(),
      image_url: imageUrl.trim(),
      face_region: faceRegion || null,
      is_active: isActive,
      sort_order: parseInt(sortOrder, 10) || 0,
    }
    startTransition(async () => {
      const result = await saveCategory(input)
      if (result?.error) setServerError(result.error)
    })
  }

  const field =
    'w-full rounded-lg border border-rim px-3 py-2 text-sm bg-card text-fg outline-none transition-colors hover:border-rim-2 focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50 font-body placeholder:text-fg-3'
  const lbl = 'block text-sm font-body font-medium text-fg-2 mb-1'
  const section = 'bg-card border border-rim rounded-2xl p-5 space-y-4'

  return (
    <div className="max-w-2xl space-y-5 pb-24">
      <div className={section}>
        <h2 className="font-body text-sm font-medium text-fg">Información básica</h2>

        <Input
          label="Nombre *"
          name="name"
          type="text"
          placeholder="Nombre de la categoría"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          disabled={isPending}
        />

        <div>
          <label className={lbl}>Slug *</label>
          <input
            className={field}
            type="text"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugManual(true) }}
            placeholder="nombre-de-categoria"
            disabled={isPending}
          />
          <p className="text-xs text-fg-3 mt-1">Solo letras minúsculas, números y guiones.</p>
        </div>

        <div>
          <label className={lbl}>Prefijo de SKU *</label>
          <input
            className={`${field} uppercase`}
            type="text"
            maxLength={3}
            value={skuPrefix}
            onChange={(e) => { setSkuPrefix(e.target.value.toUpperCase()); setSkuPrefixManual(true) }}
            placeholder="LAB"
            disabled={isPending}
          />
          <p className="text-xs text-fg-3 mt-1">
            3 letras, usadas para el SKU de los productos de esta categoría (ej. LULA-LAB-001).
          </p>
        </div>

        <div>
          <label className={lbl}>Descripción</label>
          <textarea
            className={`${field} resize-none`}
            rows={2}
            placeholder="Descripción breve de la categoría"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div>
          <label className={lbl}>URL de imagen</label>
          <input
            className={field}
            type="url"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div>
          <label className={lbl}>Zona del mapa facial</label>
          <select
            className={field}
            value={faceRegion}
            onChange={(e) => setFaceRegion(e.target.value)}
            disabled={isPending}
          >
            <option value="">Sin zona (no aparece en el mapa)</option>
            {FACE_REGIONS.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
          <p className="text-xs text-fg-3 mt-1">
            Determina en qué zona del rostro aparece esta categoría.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Orden de visualización</label>
            <input
              className={field}
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={isPending}
                className="w-4 h-4 rounded border-rim accent-accent"
              />
              <span className="font-body text-sm text-fg">Categoría activa</span>
            </label>
          </div>
        </div>
      </div>

      {serverError && (
        <p className="text-sm font-body text-error bg-error/10 px-4 py-3 rounded-xl">
          {serverError}
        </p>
      )}

      <div className="fixed bottom-0 left-0 right-0 lg:left-60 z-30 bg-card border-t border-rim px-6 py-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {initialData ? 'Guardar cambios' : 'Crear categoría'}
        </button>
      </div>
    </div>
  )
}
