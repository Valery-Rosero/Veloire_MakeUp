'use client'

import { useRef, useState, useCallback } from 'react'
import { FileSpreadsheet, Upload, AlertCircle, Download, ChevronRight, RotateCcw } from 'lucide-react'
import { useProductImportStore, type ImportProduct, type Category } from '@/lib/store/product-import'
import { readWorkbookSheets, parseWorkbook } from '@/lib/product-import/parser'
import type { ImportValidationError } from '@/lib/product-import/types'
import { nextSkuForBrandCategory } from '@/lib/sku'
import { getExistingSkus } from '@/app/admin/productos/importar/actions'

// ─── Panel de errores de validación ───────────────────────────────────────────

function ValidationErrorsPanel({ errors }: { errors: ImportValidationError[] }) {
  return (
    <div className="bg-error/8 border border-error/20 rounded-xl p-4 mt-4">
      <p className="font-body text-sm font-medium text-error mb-3">
        {errors.length} valor{errors.length !== 1 ? 'es' : ''} no permitido{errors.length !== 1 ? 's' : ''} — corrígelos en el Excel y vuelve a subirlo
      </p>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {errors.map((e, i) => (
          <div key={i} className="font-body text-xs bg-card rounded-lg p-2.5">
            <p className="text-fg">
              Hoja <span className="font-medium">{e.sheet}</span>, fila {e.row}, columna{' '}
              <span className="font-medium">{e.column}</span>: &quot;{e.value}&quot;
            </p>
            <p className="text-fg-3 mt-0.5">Valores permitidos: {e.allowed.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Preview card ─────────────────────────────────────────────────────────────

function ProductPreviewCard({ p }: { p: ImportProduct }) {
  return (
    <div className="bg-alt rounded-xl p-4">
      <div className="flex items-center gap-2">
        <p className="font-body text-sm font-medium text-fg truncate">{p.nombre}</p>
        <span
          className={`shrink-0 text-[10px] font-body font-medium px-1.5 py-0.5 rounded-full ${
            p.isExisting ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success'
          }`}
        >
          {p.isExisting ? 'Actualiza' : 'Nuevo'}
        </span>
      </div>
      <p className="font-body text-xs text-fg-3 mt-0.5 truncate font-mono">{p.sku}</p>
      <div className="flex items-center gap-3 mt-2">
        <span className="font-body text-xs text-fg-2">
          {p.shades.length} tono{p.shades.length !== 1 ? 's' : ''}
        </span>
        {p.costoUnitario > 0 && (
          <span className="font-body text-xs text-fg-2">
            Costo: ${p.costoUnitario.toLocaleString('es-CO')}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Step1Upload({ categories }: { categories: Category[] }) {
  const { setProducts } = useProductImportStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ImportValidationError[]>([])
  const [preview, setPreview] = useState<ImportProduct[]>([])

  const parseFile = useCallback(async (file: File) => {
    setParsing(true)
    setError(null)
    setValidationErrors([])
    setPreview([])

    const { sheets, error: readError } = await readWorkbookSheets(file)
    if (readError) {
      setError(readError)
      setParsing(false)
      return
    }

    const { groups, errors } = parseWorkbook(sheets, categories)

    if (errors.length > 0) {
      setValidationErrors(errors)
      setParsing(false)
      return
    }

    if (groups.length === 0) {
      setError('No se detectó ningún producto. Revisa que los nombres de las hojas coincidan con tus categorías.')
      setParsing(false)
      return
    }

    const existingSkus = new Set(await getExistingSkus())

    const products: ImportProduct[] = groups.map((g, i) => {
      const category = categories.find((c) => c.id === g.categoryId)!
      let sku = g.sku
      let isExisting = false
      if (sku) {
        isExisting = existingSkus.has(sku)
        if (!isExisting) existingSkus.add(sku) // reserva para evitar duplicados dentro del mismo archivo
      } else {
        sku = nextSkuForBrandCategory(g.marca, category.sku_prefix, existingSkus)
      }

      return {
        id: `imp-${i}-${Math.random().toString(36).slice(2, 8)}`,
        sku,
        isExisting,
        marca: g.marca,
        nombre: g.nombre,
        descripcion: g.descripcion,
        costoUnitario: g.costoUnitario,
        categoryId: g.categoryId,
        categorySlug: g.categorySlug,
        comparison: g.comparison,
        shades: g.shades.map((s, j) => ({
          id: `shd-${i}-${j}-${Math.random().toString(36).slice(2, 8)}`,
          excelRef: s.excelRef,
          name: s.excelRef,
          hexColor: '#C8C8C8',
          imageUrl: '',
          stock: s.stock,
        })),
        precioVenta: g.precioVenta,
        isFeatured: false,
        mainImageUrl: '',
        noColorVariation: false,
        publishStatus: 'draft',
      }
    })

    setPreview(products)
    setParsing(false)
  }, [categories])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) parseFile(file)
  }

  const reset = () => {
    setPreview([])
    setError(null)
    setValidationErrors([])
  }

  const handleContinue = () => {
    if (preview.length === 0) return
    setProducts(preview)
  }

  if (preview.length > 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="font-body text-sm font-medium text-success">
            ✓ Se detectaron {preview.length} producto{preview.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-sm font-body text-fg-2 hover:text-fg transition-colors"
          >
            <RotateCcw size={14} />
            Cargar otro archivo
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1 mb-6">
          {preview.map((p) => (
            <ProductPreviewCard key={p.id} p={p} />
          ))}
        </div>

        <button
          onClick={handleContinue}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
        >
          Continuar — completar información
          <ChevronRight size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <FileSpreadsheet size={28} className="text-accent" />
        </div>
        <h2 className="font-display text-2xl text-fg mb-2">Subir Excel de productos</h2>
        <p className="font-body text-sm text-fg-2 max-w-sm mx-auto leading-relaxed">
          Una hoja por categoría, con SKU para actualizar productos existentes o crear nuevos.
        </p>
      </div>

      <a
        href="/admin/productos/importar/plantilla"
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rim text-sm font-body font-medium text-fg-2 hover:bg-alt transition-colors mb-4"
      >
        <Download size={15} />
        Descargar plantilla
      </a>

      {/* Drop zone */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        disabled={parsing}
        className={`w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 transition-colors ${
          isDragging
            ? 'border-accent bg-accent/5'
            : 'border-rim hover:border-rim-2 hover:bg-alt/50'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Upload size={32} className={parsing ? 'text-accent animate-bounce' : 'text-fg-3'} />
        <div className="text-center">
          <p className="font-body text-sm font-medium text-fg">
            {parsing ? 'Leyendo archivo...' : 'Arrastra tu Excel aquí o haz clic para seleccionar'}
          </p>
          <p className="font-body text-xs text-fg-3 mt-1">Formatos: .xlsx, .xls, .csv · Máximo 10MB</p>
        </div>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f) }}
      />

      {error && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-error/10 border border-error/20 rounded-xl">
          <AlertCircle size={16} className="text-error mt-0.5 shrink-0" />
          <p className="font-body text-sm text-error">{error}</p>
        </div>
      )}

      {validationErrors.length > 0 && <ValidationErrorsPanel errors={validationErrors} />}
    </div>
  )
}
