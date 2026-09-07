'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2, ChevronLeft } from 'lucide-react'
import { useProductImportStore, isStep2Complete, type Category } from '@/lib/store/product-import'
import { upsertProductsFromImport, type ImportResult } from '@/app/admin/productos/importar/actions'

// ─── Summary row ──────────────────────────────────────────────────────────────

function SummaryRow({ product, categories }: { product: ReturnType<typeof useProductImportStore.getState>['products'][0]; categories: Category[] }) {
  const { updateProduct } = useProductImportStore()
  const price = parseFloat(product.precioVenta) || 0
  const cost = product.costoUnitario
  const pct = cost > 0 ? ((price - cost) / cost) * 100 : 0
  const catName = categories.find((c) => c.id === product.categoryId)?.name ?? '—'
  const complete = isStep2Complete(product)

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-3 items-center px-4 py-3 text-xs font-body border-b border-rim last:border-0">
      <div className="min-w-0">
        <p className="font-medium text-fg truncate">{product.nombre}</p>
        <p className="text-fg-3 truncate font-mono">{product.sku} · {catName}</p>
      </div>
      <span
        className={`whitespace-nowrap text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
          product.isExisting ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success'
        }`}
      >
        {product.isExisting ? 'Actualiza' : 'Nuevo'}
      </span>
      <span className="text-fg-2 whitespace-nowrap">{product.shades.length} tonos</span>
      <span className="text-fg whitespace-nowrap">${price.toLocaleString('es-CO')}</span>
      <span
        className={`whitespace-nowrap font-medium ${
          pct >= 30 ? 'text-success' : pct >= 10 ? 'text-warning' : 'text-error'
        }`}
      >
        {pct >= 0 ? '+' : ''}{pct.toFixed(0)}%
      </span>
      {/* Status toggle */}
      <select
        value={product.publishStatus}
        onChange={(e) => updateProduct(product.id, { publishStatus: e.target.value as 'active' | 'draft' })}
        disabled={!complete}
        className="text-xs font-body px-2 py-1 rounded-lg border border-rim bg-card text-fg focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-40"
      >
        <option value="active">Publicar</option>
        <option value="draft">Borrador</option>
      </select>
    </div>
  )
}

// ─── Results view ─────────────────────────────────────────────────────────────

function ResultsView({ results, onReset }: { results: ImportResult[]; onReset: () => void }) {
  const success = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)
  const created = success.filter((r) => !r.isExisting).length
  const updated = success.filter((r) => r.isExisting).length

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 size={32} className="text-success" />
      </div>
      <h2 className="font-display text-2xl text-fg mb-2">
        {created} creado{created !== 1 ? 's' : ''} · {updated} actualizado{updated !== 1 ? 's' : ''}
      </h2>
      {failed.length > 0 && (
        <p className="font-body text-sm text-warning mb-4">
          {failed.length} producto{failed.length !== 1 ? 's' : ''} no se pudo{failed.length !== 1 ? 'ieron' : ''} procesar.
        </p>
      )}

      {failed.length > 0 && (
        <div className="bg-error/8 border border-error/20 rounded-xl p-4 mb-6 text-left">
          <p className="font-body text-xs font-medium text-error uppercase tracking-wide mb-2">Errores</p>
          {failed.map((r) => (
            <div key={r.nombre} className="flex items-start gap-2 mb-1">
              <XCircle size={14} className="text-error mt-0.5 shrink-0" />
              <div>
                <p className="font-body text-xs font-medium text-fg">{r.nombre}</p>
                <p className="font-body text-xs text-error">{r.error}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/admin/productos"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
        >
          Ver productos
        </Link>
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-rim text-fg-2 text-sm font-body font-medium hover:bg-alt transition-colors"
        >
          Nueva importación
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Step4Confirm({ categories }: { categories: Category[] }) {
  const { products, setStep, updateProduct, reset } = useProductImportStore()
  const [results, setResults] = useState<ImportResult[] | null>(null)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const incomplete = products.filter((p) => !isStep2Complete(p))
  const totalActive = products.filter((p) => p.publishStatus === 'active').length
  const totalDraft = products.filter((p) => p.publishStatus === 'draft').length

  function setAllStatus(status: 'active' | 'draft') {
    products.forEach((p) => updateProduct(p.id, { publishStatus: status }))
  }

  function handleConfirm() {
    setErrorMsg(null)
    startTransition(async () => {
      try {
        const { results } = await upsertProductsFromImport(products)
        setResults(results)
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Error inesperado al procesar los productos.')
      }
    })
  }

  if (results) {
    return <ResultsView results={results} onReset={reset} />
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-xl text-fg">Resumen de la importación</h2>
          <p className="font-body text-sm text-fg-2 mt-0.5">
            {products.length} producto{products.length !== 1 ? 's' : ''} · {totalActive} a publicar · {totalDraft} como borrador
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAllStatus('active')}
            className="text-xs font-body px-3 py-1.5 rounded-lg border border-rim text-fg-2 hover:bg-alt transition-colors"
          >
            Publicar todos
          </button>
          <button
            onClick={() => setAllStatus('draft')}
            className="text-xs font-body px-3 py-1.5 rounded-lg border border-rim text-fg-2 hover:bg-alt transition-colors"
          >
            Todos como borrador
          </button>
        </div>
      </div>

      {incomplete.length > 0 && (
        <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 mb-4 flex items-start gap-2">
          <p className="font-body text-xs text-warning">
            {incomplete.length} producto{incomplete.length !== 1 ? 's' : ''} sin precio se guardarán como borrador independiente del selector.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-rim rounded-2xl overflow-hidden mb-6">
        <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-3 px-4 py-2.5 bg-alt border-b border-rim">
          <span className="font-body text-[10px] font-medium text-fg-3 uppercase tracking-wide">Producto</span>
          <span className="font-body text-[10px] font-medium text-fg-3 uppercase tracking-wide">Tipo</span>
          <span className="font-body text-[10px] font-medium text-fg-3 uppercase tracking-wide">Tonos</span>
          <span className="font-body text-[10px] font-medium text-fg-3 uppercase tracking-wide">Precio</span>
          <span className="font-body text-[10px] font-medium text-fg-3 uppercase tracking-wide">Ganancia</span>
          <span className="font-body text-[10px] font-medium text-fg-3 uppercase tracking-wide">Estado</span>
        </div>
        <div>
          {products.map((p) => (
            <SummaryRow key={p.id} product={p} categories={categories} />
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-error/10 border border-error/20 rounded-xl p-3 mb-4">
          <p className="font-body text-sm text-error">{errorMsg}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(3)}
          disabled={isPending}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-body text-fg-2 hover:text-fg transition-colors disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          Volver a tonos
        </button>

        <button
          onClick={handleConfirm}
          disabled={isPending || products.length === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Procesando...
            </>
          ) : (
            `Confirmar ${products.length} producto${products.length !== 1 ? 's' : ''}`
          )}
        </button>
      </div>
    </div>
  )
}
