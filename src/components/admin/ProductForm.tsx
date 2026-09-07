'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Loader2, Check } from 'lucide-react'
import { saveProduct, previewNextSku, type SaveProductInput } from '@/app/admin/productos/actions'
import { Input } from '@/components/ui/Input'
import { ImageUploader } from './ImageUploader'
import { slugify } from '@/lib/format'
import { getFieldsForCategory } from '@/lib/comparison-fields'
import { ComparisonFieldInput } from './ComparisonFieldInput'

interface ShadeRow {
  id?: string
  name: string
  hex_color: string
  stock: number
  image_url: string
  is_active: boolean
  sort_order: number
}

interface ImageRow {
  url: string
  alt_text: string
  is_main: boolean
  sort_order: number
}

interface Category {
  id: string
  name: string
  slug: string
}

interface InitialData {
  id: string
  category_id: string
  name: string
  slug: string
  sku: string
  brand: string | null
  description: string
  price: number
  compare_price: number | null
  status: 'draft' | 'active' | 'inactive'
  is_featured: boolean
  meta_title: string
  meta_description: string
  comparison: Record<string, string>
  shades: ShadeRow[]
  images: ImageRow[]
}

interface Props {
  categories: Category[]
  initialData?: InitialData
}

type ShadeFormState =
  | null
  | { mode: 'add'; data: ShadeRow }
  | { mode: 'edit'; index: number; data: ShadeRow }

function freshShade(sortOrder: number): ShadeRow {
  return { name: '', hex_color: '#D4537E', stock: 0, image_url: '', is_active: true, sort_order: sortOrder }
}


export function ProductForm({ categories, initialData }: Props) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  // Basic fields
  const [name, setName] = useState(initialData?.name ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [slugManual, setSlugManual] = useState(!!initialData)
  const [brand, setBrand] = useState(initialData?.brand ?? '')
  const [sku, setSku] = useState(initialData?.sku ?? '')
  const [skuManual, setSkuManual] = useState(!!initialData)
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [price, setPrice] = useState(String(initialData?.price ?? ''))
  const [comparePrice, setComparePrice] = useState(String(initialData?.compare_price ?? ''))
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured ?? false)
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title ?? '')
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description ?? '')
  const [comparison, setComparison] = useState<Record<string, string>>(initialData?.comparison ?? {})

  const selectedCategory = categories.find((c) => c.id === categoryId)
  const comparisonFields = selectedCategory ? getFieldsForCategory(selectedCategory.slug) : []

  // Auto-genera el SKU mientras se crea un producto nuevo (nunca al editar uno
  // existente) y mientras el usuario no lo haya editado a mano.
  const skuRequestId = useRef(0)
  useEffect(() => {
    if (initialData || skuManual || !categoryId) return
    const requestId = ++skuRequestId.current
    const timeout = setTimeout(async () => {
      const result = await previewNextSku(categoryId, brand.trim() || null)
      if (requestId === skuRequestId.current && 'sku' in result) setSku(result.sku)
    }, 400)
    return () => clearTimeout(timeout)
  }, [categoryId, brand, initialData, skuManual])

  // Images
  const [images, setImages] = useState<ImageRow[]>(
    initialData?.images.length ? initialData.images : []
  )

  // Shades
  const [shades, setShades] = useState<ShadeRow[]>(initialData?.shades ?? [])
  const [removedShadeIds, setRemovedShadeIds] = useState<string[]>([])
  const [shadeForm, setShadeForm] = useState<ShadeFormState>(null)

  function handleNameChange(value: string) {
    setName(value)
    if (!slugManual) setSlug(slugify(value))
  }

  // ── Images ──────────────────────────────────────────────────────────────
  function setMainImage(url: string) {
    setImages((prev) => {
      const existing = prev.find((img) => img.url === url)
      if (existing) {
        return prev.map((img) => ({ ...img, is_main: img.url === url }))
      }
      const newImg: ImageRow = { url, alt_text: '', is_main: true, sort_order: 0 }
      const others = prev.map((img) => ({ ...img, is_main: false, sort_order: img.sort_order + 1 }))
      return [newImg, ...others]
    })
  }

  function addGalleryImage(url: string) {
    setImages((prev) => [
      ...prev,
      { url, alt_text: '', is_main: prev.length === 0, sort_order: prev.length },
    ])
  }

  function removeImage(url: string) {
    setImages((prev) => {
      const next = prev.filter((img) => img.url !== url)
      if (next.length > 0 && !next.some((img) => img.is_main)) next[0].is_main = true
      return next
    })
  }

  const mainImageUrl = images.find((img) => img.is_main)?.url ?? ''
  const galleryImages = images.filter((img) => !img.is_main)

  // ── Shades ───────────────────────────────────────────────────────────────
  function openAddShade() {
    setShadeForm({ mode: 'add', data: freshShade(shades.length) })
  }

  function openEditShade(index: number) {
    setShadeForm({ mode: 'edit', index, data: { ...shades[index] } })
  }

  function cancelShadeForm() {
    setShadeForm(null)
  }

  function saveShade() {
    if (!shadeForm) return
    const { data } = shadeForm
    if (!data.name.trim()) return
    if (!/^#[0-9A-Fa-f]{6}$/.test(data.hex_color)) return

    if (shadeForm.mode === 'add') {
      setShades((prev) => [...prev, { ...data, sort_order: prev.length }])
    } else {
      setShades((prev) => prev.map((s, i) => (i === shadeForm.index ? data : s)))
    }
    setShadeForm(null)
  }

  function removeShade(index: number) {
    const shade = shades[index]
    if (shade.id) setRemovedShadeIds((prev) => [...prev, shade.id!])
    setShades((prev) => prev.filter((_, i) => i !== index))
    if (shadeForm && shadeForm.mode === 'edit' && shadeForm.index === index) {
      setShadeForm(null)
    }
  }

  function updateShadeField<K extends keyof ShadeRow>(field: K, value: ShadeRow[K]) {
    if (!shadeForm) return
    setShadeForm({ ...shadeForm, data: { ...shadeForm.data, [field]: value } })
  }

  // ── Ficha de comparación ─────────────────────────────────────────────────
  function updateComparisonField(key: string, value: string) {
    setComparison((prev) => ({ ...prev, [key]: value }))
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  function buildInput(targetStatus: 'draft' | 'active' | 'inactive'): SaveProductInput | null {
    if (!name.trim() || !slug.trim() || !categoryId || !price) {
      setServerError('Completa los campos obligatorios: nombre, slug, categoría y precio.')
      return null
    }
    if (!sku.trim()) {
      setServerError('El SKU es obligatorio.')
      return null
    }
    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setServerError('El precio debe ser un número mayor a 0.')
      return null
    }
    const parsedCompare = comparePrice ? parseFloat(comparePrice) : null
    if (parsedCompare !== null && parsedCompare <= parsedPrice) {
      setServerError('El precio anterior debe ser mayor que el precio actual.')
      return null
    }
    if (targetStatus === 'active' && shades.length === 0) {
      setServerError('Debes añadir al menos un tono antes de activar el producto.')
      return null
    }
    return {
      id: initialData?.id,
      category_id: categoryId,
      name: name.trim(),
      slug: slug.trim(),
      sku: sku.trim(),
      brand: brand.trim() || null,
      description: description.trim(),
      price: parsedPrice,
      compare_price: parsedCompare,
      status: targetStatus,
      is_featured: isFeatured,
      meta_title: metaTitle.trim(),
      meta_description: metaDescription.trim(),
      comparison,
      shades,
      removedShadeIds,
      images,
    }
  }

  function handleSave(targetStatus: 'draft' | 'active' | 'inactive') {
    const input = buildInput(targetStatus)
    if (!input) return
    setServerError(null)
    startTransition(async () => {
      const result = await saveProduct(input)
      if (result?.error) setServerError(result.error)
    })
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const field =
    'w-full rounded-lg border border-rim px-3 py-2 text-sm bg-card text-fg outline-none transition-colors hover:border-rim-2 focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50 font-body placeholder:text-fg-3'
  const lbl = 'block text-sm font-body font-medium text-fg-2 mb-1'
  const section = 'bg-card border border-rim rounded-2xl p-5 space-y-4'

  return (
    <div className="max-w-2xl space-y-5 pb-24">
      {/* ── 1. Basic info ─────────────────────────────────────────────────── */}
      <div className={section}>
        <h2 className="font-body text-sm font-medium text-fg">Información básica</h2>

        <Input
          label="Nombre *"
          name="name"
          type="text"
          placeholder="Nombre del producto"
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
            placeholder="url-del-producto"
            disabled={isPending}
          />
          <p className="text-xs text-fg-3 mt-1">Generado del nombre. Solo letras, números y guiones.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Marca"
            name="brand"
            type="text"
            placeholder="Ej: Lula"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            disabled={isPending}
          />
          <div>
            <label className={lbl}>SKU *</label>
            <input
              className={`${field} font-mono uppercase`}
              type="text"
              value={sku}
              onChange={(e) => { setSku(e.target.value.toUpperCase()); setSkuManual(true) }}
              placeholder="MARC-CAT-001"
              disabled={isPending}
            />
            <p className="text-xs text-fg-3 mt-1">
              {initialData ? 'Editable si necesitas corregirlo.' : 'Se genera solo, pero puedes editarlo.'}
            </p>
          </div>
        </div>

        <div>
          <label className={lbl}>Categoría *</label>
          <select
            className={field}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isPending}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={lbl.replace('mb-1', '')}>Descripción</label>
            <span className="text-xs text-fg-3">{description.length}/500</span>
          </div>
          <textarea
            className={`${field} resize-none`}
            rows={3}
            placeholder="Descripción del producto"
            value={description}
            maxLength={500}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Precio (COP) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-fg-3 font-body">$</span>
              <input
                className={`${field} pl-7`}
                type="number"
                placeholder="25000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>
          <div>
            <label className={lbl}>Precio anterior</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-fg-3 font-body">$</span>
              <input
                className={`${field} pl-7`}
                type="number"
                placeholder="30000"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                disabled={isPending}
              />
            </div>
            {comparePrice && parseFloat(comparePrice) <= parseFloat(price || '0') && (
              <p className="text-xs text-error mt-1">Debe ser mayor que el precio actual.</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              disabled={isPending}
              className="w-4 h-4 rounded border-rim accent-accent"
            />
            <span className="font-body text-sm text-fg">Producto destacado</span>
          </label>
        </div>
      </div>

      {/* ── 2. Images ──────────────────────────────────────────────────────── */}
      <div className={section}>
        <h2 className="font-body text-sm font-medium text-fg">Imágenes</h2>

        <div>
          <label className={lbl}>Imagen principal</label>
          {mainImageUrl ? (
            <div className="flex items-start gap-3">
              <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-rim shrink-0">
                <Image src={mainImageUrl} alt="Principal" fill className="object-cover" />
              </div>
              <button
                type="button"
                onClick={() => removeImage(mainImageUrl)}
                className="text-xs font-body text-error hover:opacity-80 transition-opacity mt-2"
              >
                Eliminar imagen principal
              </button>
            </div>
          ) : (
            <ImageUploader
              value=""
              onChange={setMainImage}
              hint="Usa fondo blanco o nude para mejores resultados."
            />
          )}
        </div>

        {/* Gallery */}
        <div>
          <label className={lbl}>Galería adicional ({galleryImages.length}/4)</label>
          <div className="grid grid-cols-4 gap-2">
            {galleryImages.map((img) => (
              <div key={img.url} className="relative aspect-square rounded-xl overflow-hidden border border-rim group">
                <Image src={img.url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(img.url)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                >
                  ×
                </button>
              </div>
            ))}
            {galleryImages.length < 4 && (
              <div className="aspect-square">
                <ImageUploader
                  value=""
                  onChange={addGalleryImage}
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Shades ──────────────────────────────────────────────────────── */}
      <div className={section}>
        <div className="flex items-center justify-between">
          <h2 className="font-body text-sm font-medium text-fg">
            Tonos disponibles
            {shades.length > 0 && (
              <span className="ml-2 text-xs text-fg-3 font-normal">{shades.length} tono{shades.length !== 1 ? 's' : ''}</span>
            )}
          </h2>
          <button
            type="button"
            onClick={openAddShade}
            disabled={isPending || shadeForm?.mode === 'add'}
            className="flex items-center gap-1 text-xs font-body text-accent hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            <Plus size={13} />
            Añadir tono
          </button>
        </div>

        {/* Shade list */}
        {shades.length > 0 && (
          <div className="space-y-1">
            {shades.map((shade, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-alt">
                <div
                  className="w-6 h-6 rounded-full border border-rim shrink-0"
                  style={{ backgroundColor: shade.hex_color }}
                />
                <span className="font-body text-sm text-fg flex-1 truncate">{shade.name}</span>
                <span className="font-body text-xs text-fg-3">{shade.stock} und.</span>
                <button
                  type="button"
                  onClick={() => openEditShade(i)}
                  className="text-fg-3 hover:text-accent transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => removeShade(i)}
                  className="text-fg-3 hover:text-error transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {shades.length === 0 && !shadeForm && (
          <p className="text-sm font-body text-fg-3 text-center py-2">
            Sin tonos aún. Añade al menos uno para publicar el producto.
          </p>
        )}

        {/* Animated shade form */}
        <AnimatePresence>
          {shadeForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="border border-rim rounded-xl p-4 space-y-3 bg-highlight mt-2">
                <p className="font-body text-xs font-medium text-fg-2 uppercase tracking-wide">
                  {shadeForm.mode === 'add' ? 'Nuevo tono' : 'Editar tono'}
                </p>

                <div>
                  <label className={lbl}>Nombre del tono *</label>
                  <input
                    className={field}
                    type="text"
                    placeholder="Ej: Rojo Pasión"
                    value={shadeForm.data.name}
                    onChange={(e) => updateShadeField('name', e.target.value)}
                  />
                </div>

                <div>
                  <label className={lbl}>Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={shadeForm.data.hex_color}
                      onChange={(e) => updateShadeField('hex_color', e.target.value)}
                      className="w-10 h-9 rounded-lg border border-rim cursor-pointer bg-card"
                    />
                    <input
                      className={`${field} flex-1 font-mono`}
                      type="text"
                      placeholder="#D4537E"
                      value={shadeForm.data.hex_color}
                      onChange={(e) => updateShadeField('hex_color', e.target.value)}
                    />
                    <div
                      className="w-9 h-9 rounded-full border border-rim shrink-0"
                      style={{ backgroundColor: shadeForm.data.hex_color }}
                    />
                  </div>
                </div>

                <div>
                  <label className={lbl}>Foto del tono</label>
                  <ImageUploader
                    value={shadeForm.data.image_url}
                    onChange={(url) => updateShadeField('image_url', url)}
                    hint="Si no subes foto, se usará la imagen principal del producto."
                    size="sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Stock</label>
                    <input
                      className={field}
                      type="number"
                      min={0}
                      value={shadeForm.data.stock}
                      onChange={(e) => updateShadeField('stock', parseInt(e.target.value, 10) || 0)}
                    />
                  </div>
                  <div className="flex items-end pb-0.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shadeForm.data.is_active}
                        onChange={(e) => updateShadeField('is_active', e.target.checked)}
                        className="w-4 h-4 rounded border-rim accent-accent"
                      />
                      <span className="font-body text-sm text-fg">Activo</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={saveShade}
                    disabled={!shadeForm.data.name.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Check size={14} />
                    Guardar tono
                  </button>
                  <button
                    type="button"
                    onClick={cancelShadeForm}
                    className="px-4 py-2 rounded-xl border border-rim text-sm font-body text-fg-2 hover:border-rim-2 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 4. Ficha de comparación ────────────────────────────────────────── */}
      {selectedCategory && (
        <div className={section}>
          <h2 className="font-body text-sm font-medium text-fg">Ficha de comparación</h2>
          {comparisonFields.length === 0 ? (
            <p className="text-sm font-body text-fg-3">
              Esta categoría no tiene ficha de comparación.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {comparisonFields.map((f) => (
                <ComparisonFieldInput
                  key={f.key}
                  field={f}
                  value={comparison[f.key] ?? ''}
                  onChange={(v) => updateComparisonField(f.key, v)}
                  fieldClass={field}
                  lblClass={lbl}
                  disabled={isPending}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 5. SEO ─────────────────────────────────────────────────────────── */}
      <div className={section}>
        <h2 className="font-body text-sm font-medium text-fg">SEO (opcional)</h2>
        <Input
          label="Meta título"
          name="meta_title"
          type="text"
          placeholder="Título para buscadores"
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          disabled={isPending}
        />
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={lbl.replace('mb-1', '')}>Meta descripción</label>
            <span className="text-xs text-fg-3">{metaDescription.length}/160</span>
          </div>
          <textarea
            className={`${field} resize-none`}
            rows={2}
            placeholder="Descripción para buscadores"
            value={metaDescription}
            maxLength={160}
            onChange={(e) => setMetaDescription(e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>

      {serverError && (
        <p className="text-sm font-body text-error bg-error/10 px-4 py-3 rounded-xl">
          {serverError}
        </p>
      )}

      {/* ── Sticky footer buttons ──────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-60 z-30 bg-card border-t border-rim px-6 py-4 flex gap-3">
        <button
          type="button"
          onClick={() => handleSave('draft')}
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-rim text-sm font-body text-fg-2 hover:border-rim-2 hover:text-fg transition-colors disabled:opacity-50"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          Guardar borrador
        </button>
        <button
          type="button"
          onClick={() => handleSave('active')}
          disabled={isPending || shades.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          title={shades.length === 0 ? 'Añade al menos un tono para publicar' : undefined}
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {initialData ? 'Publicar cambios' : 'Publicar producto'}
        </button>
      </div>
    </div>
  )
}
