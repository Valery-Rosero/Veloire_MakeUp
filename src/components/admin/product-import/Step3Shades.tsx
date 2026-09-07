'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useProductImportStore, type ImportProduct } from '@/lib/store/product-import'
import { ImageUploader } from '@/components/admin/ImageUploader'

// ─── Single shade row ─────────────────────────────────────────────────────────

function ShadeRow({
  shade,
  productId,
  noColor,
}: {
  shade: { id: string; excelRef: string; name: string; hexColor: string; imageUrl: string; stock: number }
  productId: string
  noColor: boolean
}) {
  const { updateShade } = useProductImportStore()

  return (
    <div className="bg-alt rounded-xl p-4 space-y-3">
      {/* Header with color preview */}
      <div className="flex items-center gap-3">
        {!noColor && (
          <div
            className="w-6 h-6 rounded-full border border-rim shrink-0"
            style={{ backgroundColor: shade.hexColor || '#C8C8C8' }}
          />
        )}
        <p className="font-body text-xs text-fg-3">Referencia original: {shade.excelRef}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Name */}
        <div>
          <label className="font-body text-xs text-fg-2 block mb-1">Nombre del tono</label>
          <input
            type="text"
            value={shade.name}
            onChange={(e) => updateShade(productId, shade.id, { name: e.target.value })}
            placeholder={shade.excelRef}
            className="w-full px-3 py-2 rounded-lg border border-rim bg-card font-body text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>

        {/* Stock */}
        <div>
          <label className="font-body text-xs text-fg-2 block mb-1">Stock (unidades)</label>
          <input
            type="number"
            min={0}
            value={shade.stock}
            onChange={(e) =>
              updateShade(productId, shade.id, { stock: Math.max(0, parseInt(e.target.value) || 0) })
            }
            className="w-full px-3 py-2 rounded-lg border border-rim bg-card font-body text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </div>

      {/* Color picker — hidden when noColor */}
      {!noColor && (
        <div>
          <label className="font-body text-xs text-fg-2 block mb-1">Color (hex)</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={shade.hexColor || '#C8C8C8'}
              onChange={(e) => updateShade(productId, shade.id, { hexColor: e.target.value })}
              className="w-9 h-9 rounded-lg border border-rim cursor-pointer p-0.5 bg-card"
            />
            <input
              type="text"
              value={shade.hexColor}
              onChange={(e) => {
                const val = e.target.value
                if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                  updateShade(productId, shade.id, { hexColor: val })
                }
              }}
              maxLength={7}
              placeholder="#C8C8C8"
              className="flex-1 px-3 py-2 rounded-lg border border-rim bg-card font-body text-sm font-mono text-fg focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>
      )}

      {/* Shade image */}
      <div>
        <label className="font-body text-xs text-fg-2 block mb-1">
          Foto de este tono{' '}
          <span className="text-fg-3">(opcional — si no subes, se usa la imagen principal)</span>
        </label>
        <ImageUploader
          value={shade.imageUrl}
          onChange={(url) => updateShade(productId, shade.id, { imageUrl: url })}
          size="sm"
          hint="JPG, PNG o WebP · máx. 5MB"
        />
      </div>
    </div>
  )
}

// ─── Product shades form ──────────────────────────────────────────────────────

function ProductShadesForm({ product }: { product: ImportProduct }) {
  const { updateProduct, updateShade } = useProductImportStore()

  const toggleNoColor = (val: boolean) => {
    updateProduct(product.id, { noColorVariation: val })
    if (val) {
      product.shades.forEach((s) => {
        updateShade(product.id, s.id, { hexColor: '#C8C8C8' })
      })
    }
  }

  return (
    <div className="space-y-5">
      {/* Main image */}
      <div className="bg-card border border-rim rounded-xl p-4">
        <p className="font-body text-sm font-medium text-fg mb-1">Imagen principal</p>
        <p className="font-body text-xs text-fg-3 mb-3">
          Se usará como respaldo si un tono no tiene foto propia.
        </p>
        <ImageUploader
          value={product.mainImageUrl}
          onChange={(url) => updateProduct(product.id, { mainImageUrl: url })}
          hint="Imagen principal del producto"
        />
      </div>

      {/* No color variation toggle */}
      <label className="flex items-center gap-3 cursor-pointer bg-card border border-rim rounded-xl p-4">
        <input
          type="checkbox"
          checked={product.noColorVariation}
          onChange={(e) => toggleNoColor(e.target.checked)}
          className="w-4 h-4 accent-accent rounded"
        />
        <div>
          <p className="font-body text-sm font-medium text-fg">Este producto no tiene variación de color</p>
          <p className="font-body text-xs text-fg-3">
            Los tonos son referencias de cantidad, no de color. Se usará círculo gris neutro.
          </p>
        </div>
      </label>

      {/* Shades */}
      <div>
        <p className="font-body text-sm font-medium text-fg mb-3">
          Tonos / referencias ({product.shades.length})
        </p>
        <div className="space-y-3">
          {product.shades.map((shade) => (
            <ShadeRow
              key={shade.id}
              shade={shade}
              productId={product.id}
              noColor={product.noColorVariation}
            />
          ))}
          {product.shades.length === 0 && (
            <p className="font-body text-sm text-fg-3 italic">
              Este producto no tiene tonos detectados en el Excel.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Step3Shades() {
  const { products, productIdx, setProductIdx, setStep } = useProductImportStore()

  const current = products[productIdx]
  const total = products.length
  const canGoNext = productIdx < total - 1
  const canGoPrev = productIdx > 0

  if (!current) return null

  return (
    <div className="max-w-2xl mx-auto">
      {/* Product progress */}
      <div className="flex items-center justify-between mb-5">
        <p className="font-body text-sm font-medium text-fg">
          {current.nombre}
        </p>
        <span className="font-body text-xs text-fg-3 bg-alt px-3 py-1 rounded-full">
          Producto {productIdx + 1} de {total}
        </span>
      </div>

      {/* Product mini-nav dots */}
      {total > 1 && (
        <div className="flex items-center gap-1.5 mb-5">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => setProductIdx(i)}
              className={`transition-all rounded-full ${
                i === productIdx ? 'w-5 h-1.5 bg-accent' : 'w-1.5 h-1.5 bg-rim-2 hover:bg-accent/50'
              }`}
              aria-label={`Producto ${i + 1}`}
            />
          ))}
        </div>
      )}

      <ProductShadesForm product={current} />

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-rim">
        <button
          onClick={() => {
            if (canGoPrev) setProductIdx(productIdx - 1)
            else setStep(2)
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-body text-fg-2 hover:text-fg transition-colors"
        >
          <ChevronLeft size={16} />
          {canGoPrev ? 'Anterior' : 'Volver a información'}
        </button>

        {canGoNext ? (
          <button
            onClick={() => setProductIdx(productIdx + 1)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-card border border-rim text-sm font-body font-medium text-fg hover:bg-alt transition-colors"
          >
            Siguiente producto
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => setStep(4)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
          >
            Revisar y publicar
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
