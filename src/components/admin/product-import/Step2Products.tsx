'use client'

import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import {
  useProductImportStore,
  isStep2Complete,
  type ImportProduct,
  type Category,
} from '@/lib/store/product-import'
import { getFieldsForCategory } from '@/lib/comparison-fields'
import { ComparisonFieldInput } from '@/components/admin/ComparisonFieldInput'

// ─── Profit calculator ────────────────────────────────────────────────────────

function ProfitCalc({ product }: { product: ImportProduct }) {
  const price = parseFloat(product.precioVenta) || 0
  const cost = product.costoUnitario
  const qty = product.shades.length || 1

  if (price <= 0 || cost <= 0) return null

  const pct = ((price - cost) / cost) * 100
  const perUnit = price - cost
  const totalProfit = perUnit * qty
  const totalRevenue = price * qty

  const color =
    pct >= 30 ? 'text-success' : pct >= 10 ? 'text-warning' : 'text-error'
  const bg =
    pct >= 30 ? 'bg-success/8 border-success/20' : pct >= 10 ? 'bg-warning/8 border-warning/20' : 'bg-error/8 border-error/20'

  return (
    <div className={`rounded-xl border p-4 ${bg} mt-3`}>
      <div className="flex items-center justify-between mb-3">
        <p className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide">Rentabilidad</p>
        <span className={`font-display text-2xl font-normal ${color}`}>
          {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs font-body">
        <div>
          <p className="text-fg-3">Compraste cada uno a</p>
          <p className="font-medium text-fg mt-0.5">${cost.toLocaleString('es-CO')}</p>
        </div>
        <div>
          <p className="text-fg-3">Lo venderás a</p>
          <p className="font-medium text-fg mt-0.5">${price.toLocaleString('es-CO')}</p>
        </div>
        <div>
          <p className="text-fg-3">Ganarás por unidad</p>
          <p className={`font-medium mt-0.5 ${color}`}>${perUnit.toLocaleString('es-CO')}</p>
        </div>
        <div>
          <p className="text-fg-3">Total ingresos (todo el lote)</p>
          <p className="font-medium text-fg mt-0.5">${totalRevenue.toLocaleString('es-CO')}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-current/10 flex justify-between text-xs font-body">
        <span className="text-fg-3">Ganancia total del lote ({qty} unidades)</span>
        <span className={`font-semibold ${color}`}>${totalProfit.toLocaleString('es-CO')}</span>
      </div>
      {price < cost && (
        <p className="font-body text-xs text-error mt-2 font-medium">
          ⚠ El precio de venta es menor al costo. Ajústalo antes de publicar.
        </p>
      )}
    </div>
  )
}

// ─── Product form ─────────────────────────────────────────────────────────────

const field = 'w-full px-3.5 py-2.5 rounded-xl border border-rim bg-card font-body text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent'
const lbl = 'font-body text-sm font-medium text-fg block mb-1.5'

function ProductForm({
  product,
  categories,
}: {
  product: ImportProduct
  categories: Category[]
}) {
  const { updateProduct } = useProductImportStore()
  const id = product.id
  const categoryName = categories.find((c) => c.id === product.categoryId)?.name ?? '—'
  const comparisonFields = getFieldsForCategory(product.categorySlug)

  function updateComparison(key: string, value: string) {
    updateProduct(id, { comparison: { ...product.comparison, [key]: value } })
  }

  return (
    <div className="space-y-5">
      {/* Header (read-only) */}
      <div className="bg-alt rounded-xl p-4">
        <div className="flex items-center justify-between">
          <p className="font-body text-xs text-fg-3 uppercase tracking-wide">Del Excel</p>
          <span
            className={`text-[10px] font-body font-medium px-1.5 py-0.5 rounded-full ${
              product.isExisting ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success'
            }`}
          >
            {product.isExisting ? 'Actualiza existente' : 'Nuevo'}
          </span>
        </div>
        <p className="font-body text-sm font-medium text-fg mt-1">{product.nombre}</p>
        <p className="font-body text-xs text-fg-2 mt-0.5">{product.marca} · {categoryName}</p>
        {product.descripcion && (
          <p className="font-body text-xs text-fg-3 mt-1 line-clamp-2">{product.descripcion}</p>
        )}
        <div className="flex gap-4 mt-2 text-xs font-body text-fg-3">
          <span>{product.shades.length} tono{product.shades.length !== 1 ? 's' : ''}</span>
          {product.costoUnitario > 0 && (
            <span>Costo unitario: ${product.costoUnitario.toLocaleString('es-CO')}</span>
          )}
        </div>
      </div>

      {/* SKU */}
      <div>
        <label className={lbl}>SKU</label>
        <input
          type="text"
          value={product.sku}
          onChange={(e) => updateProduct(id, { sku: e.target.value.toUpperCase() })}
          disabled={product.isExisting}
          className={`${field} font-mono uppercase disabled:opacity-60`}
        />
        {product.isExisting && (
          <p className="font-body text-xs text-fg-3 mt-1">
            Este SKU ya existe — se actualizará ese producto en vez de crear uno nuevo.
          </p>
        )}
      </div>

      {/* Precio de venta */}
      <div>
        <label className={lbl}>
          Precio de venta al público (COP) <span className="text-error">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-body text-sm text-fg-3">$</span>
          <input
            type="number"
            min={0}
            value={product.precioVenta}
            onChange={(e) => updateProduct(id, { precioVenta: e.target.value })}
            placeholder="25000"
            className={`${field} pl-8`}
          />
        </div>
        <ProfitCalc product={product} />
      </div>

      {/* Ficha de comparación */}
      {comparisonFields.length > 0 && (
        <div>
          <label className={lbl}>Ficha de comparación</label>
          <div className="grid grid-cols-2 gap-3">
            {comparisonFields.map((f) => (
              <ComparisonFieldInput
                key={f.key}
                field={f}
                value={product.comparison[f.key] ?? ''}
                onChange={(v) => updateComparison(f.key, v)}
                fieldClass={field}
                lblClass="font-body text-xs text-fg-2 block mb-1"
              />
            ))}
          </div>
        </div>
      )}

      {/* Destacado */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={product.isFeatured}
          onChange={(e) => updateProduct(id, { isFeatured: e.target.checked })}
          className="w-4 h-4 accent-accent rounded"
        />
        <div>
          <p className="font-body text-sm font-medium text-fg">Producto destacado</p>
          <p className="font-body text-xs text-fg-3">Aparece en la sección &quot;Destacados&quot; del inicio</p>
        </div>
      </label>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Step2Products({ categories }: { categories: Category[] }) {
  const { products, productIdx, setProductIdx, setStep } = useProductImportStore()

  const current = products[productIdx]
  const allDone = products.every(isStep2Complete)
  const total = products.length

  if (!current) return null

  const canGoNext = productIdx < total - 1
  const canGoPrev = productIdx > 0

  return (
    <div className="flex gap-6 max-w-4xl mx-auto">
      {/* ── Sidebar: product list ── */}
      <div className="hidden md:flex flex-col w-52 shrink-0">
        <p className="font-body text-xs font-medium text-fg-3 uppercase tracking-wide mb-3 px-1">
          Productos ({total})
        </p>
        <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
          {products.map((p, i) => {
            const done = isStep2Complete(p)
            const active = i === productIdx
            return (
              <button
                key={p.id}
                onClick={() => setProductIdx(i)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-colors ${
                  active
                    ? 'bg-accent/10 text-accent'
                    : 'hover:bg-alt text-fg-2 hover:text-fg'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ${
                    done ? 'bg-success border-success' : 'border-rim-2'
                  }`}
                >
                  {done && <Check size={10} strokeWidth={3} className="text-white" />}
                </div>
                <span className="font-body text-xs truncate">{p.nombre}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Main form area ── */}
      <div className="flex-1 min-w-0">
        {/* Mobile progress */}
        <p className="md:hidden font-body text-xs text-fg-3 mb-4">
          Completando producto {productIdx + 1} de {total}
        </p>

        {/* Desktop progress */}
        <div className="hidden md:flex items-center justify-between mb-5">
          <p className="font-body text-sm font-medium text-fg">
            Producto {productIdx + 1} de {total}
          </p>
          {allDone && (
            <span className="font-body text-xs text-success font-medium">✓ Todos completados</span>
          )}
        </div>

        <ProductForm product={current} categories={categories} />

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-rim">
          <button
            onClick={() => canGoPrev && setProductIdx(productIdx - 1)}
            disabled={!canGoPrev}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-body text-fg-2 hover:text-fg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
            Anterior
          </button>

          {canGoNext ? (
            <button
              onClick={() => setProductIdx(productIdx + 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-card border border-rim text-sm font-body font-medium text-fg hover:bg-alt transition-colors"
            >
              Siguiente
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => setStep(3)}
              disabled={!allDone}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuar a tonos
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {!allDone && productIdx === total - 1 && (
          <p className="font-body text-xs text-fg-3 text-center mt-2">
            Completa el precio de todos los productos para continuar.
          </p>
        )}
      </div>
    </div>
  )
}
