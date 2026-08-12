'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Search, Loader2, ArrowRight, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchResult {
  id: string
  name: string
  slug: string
  price: number
  compare_price: number | null
  brand: string | null
  category_name: string | null
  image_url: string | null
  image_alt: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SUGGESTIONS = ['Labial', 'Base', 'Sombras', 'Blush', 'Contorno', 'Iluminador']

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n)
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onClose: () => void
}

export function SearchOverlay({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  // Focus + reset on open/close
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    } else {
      setQuery('')
      setResults([])
      setSearched(false)
      setLoading(false)
    }
  }, [open])

  // Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Block body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const doSearch = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (trimmed.length < 2) {
      setResults([])
      setSearched(false)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
      const data = await res.json()
      setResults(data.results ?? [])
      setSearched(true)
    } catch {
      setResults([])
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(val), 300)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim().length >= 2) {
      onClose()
      router.push(`/catalogo?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleSuggestion = (tag: string) => {
    setQuery(tag)
    doSearch(tag)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[59] bg-black/20"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-[60] flex flex-col shadow-2xl bg-alt"
            style={{ maxHeight: '85vh' }}
          >
            {/* Barra de búsqueda */}
            <div className="flex items-center gap-3 px-5 md:px-10 border-b border-[#e8d0c0]" style={{ minHeight: '64px' }}>
              <Search size={17} strokeWidth={1.5} className="text-accent shrink-0" />
              <form onSubmit={handleSubmit} className="flex-1">
                <input
                  ref={inputRef}
                  value={query}
                  onChange={handleChange}
                  placeholder="Buscar productos, marcas, tonos…"
                  className="w-full bg-transparent font-body text-[16px] text-fg placeholder:text-fg-3 outline-none py-4"
                />
              </form>
              {loading ? (
                <Loader2 size={16} className="text-accent animate-spin shrink-0" />
              ) : query && (
                <button
                  onClick={() => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus() }}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-highlight text-fg-2 hover:text-fg transition-colors shrink-0"
                  aria-label="Limpiar"
                >
                  <X size={13} strokeWidth={2} />
                </button>
              )}
              <button
                onClick={onClose}
                aria-label="Cerrar búsqueda"
                className="w-9 h-9 flex items-center justify-center text-fg-2 hover:text-fg transition-colors shrink-0 ml-1"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Contenido */}
            <div className="overflow-y-auto flex-1">
              <div className="max-w-3xl mx-auto px-5 md:px-10 py-5">

                {/* Resultados */}
                {results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    <p className="font-body text-[10px] uppercase tracking-[2.5px] text-fg-3 mb-3">
                      {results.length} resultado{results.length !== 1 ? 's' : ''} para &ldquo;{query}&rdquo;
                    </p>

                    <div className="flex flex-col">
                      {results.map((r, i) => (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.18 }}
                        >
                          <Link
                            href={`/producto/${r.slug}`}
                            onClick={onClose}
                            className="group flex items-center gap-4 py-3 px-3 -mx-3 rounded-xl hover:bg-highlight transition-colors"
                          >
                            {/* Imagen */}
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-highlight shrink-0 border border-[#e8d0c0]">
                              {r.image_url ? (
                                <Image
                                  src={r.image_url}
                                  alt={r.image_alt ?? r.name}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="font-display text-xl text-accent">V</span>
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-display text-[15px] text-fg group-hover:text-accent transition-colors truncate leading-snug">
                                {r.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                {r.brand && (
                                  <span className="font-body text-[11px] text-fg-3 uppercase tracking-wide">{r.brand}</span>
                                )}
                                {r.brand && r.category_name && (
                                  <span className="text-fg-3 text-[10px]">·</span>
                                )}
                                {r.category_name && (
                                  <span className="font-body text-[11px] text-fg-3">{r.category_name}</span>
                                )}
                              </div>
                            </div>

                            {/* Precio */}
                            <div className="text-right shrink-0">
                              <p className="font-body text-[14px] font-semibold text-fg">{formatPrice(r.price)}</p>
                              {r.compare_price && r.compare_price > r.price && (
                                <p className="font-body text-[11px] text-fg-3 line-through">{formatPrice(r.compare_price)}</p>
                              )}
                            </div>

                            <ArrowRight size={13} className="text-fg-3 group-hover:text-accent transition-colors shrink-0" />
                          </Link>

                          {i < results.length - 1 && (
                            <div className="border-b border-[#e8d0c0]/60 mx-3" />
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Ver todos */}
                    {results.length >= 10 && (
                      <Link
                        href={`/catalogo?q=${encodeURIComponent(query.trim())}`}
                        onClick={onClose}
                        className="mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#e8d0c0] text-sm font-body text-fg-2 hover:text-fg hover:border-fg-3 transition-colors"
                      >
                        Ver todos los resultados para &ldquo;{query}&rdquo;
                        <ArrowRight size={13} />
                      </Link>
                    )}
                  </motion.div>
                )}

                {/* Sin resultados */}
                {searched && results.length === 0 && !loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <p className="font-display italic text-[26px] text-fg-3 mb-2">Sin resultados</p>
                    <p className="font-body text-[14px] text-fg-3">
                      No encontramos productos para{' '}
                      <span className="text-fg font-medium">&ldquo;{query}&rdquo;</span>
                    </p>
                    <p className="font-body text-[13px] text-fg-3 mt-1">
                      Intenta con otra palabra o explora el catálogo
                    </p>
                    <Link
                      href="/catalogo"
                      onClick={onClose}
                      className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-noir text-beige text-sm font-body hover:opacity-90 transition-opacity"
                    >
                      Ver catálogo completo <ArrowRight size={13} />
                    </Link>
                  </motion.div>
                )}

                {/* Estado inicial — sugerencias */}
                {!searched && !loading && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp size={13} strokeWidth={1.5} className="text-fg-3" />
                      <p className="font-body text-[10px] uppercase tracking-[2.5px] text-fg-3">Búsquedas populares</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleSuggestion(tag)}
                          className="px-4 py-1.5 rounded-full border border-[#e8d0c0] font-body text-[13px] text-fg-2 hover:text-accent hover:border-accent transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
