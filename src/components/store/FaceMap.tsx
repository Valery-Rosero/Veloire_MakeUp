'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Transition } from 'framer-motion'
import { X } from 'lucide-react'
import { FACE_REGIONS, getFaceRegionLabel } from '@/lib/face-regions'

interface Category {
  id: string
  name: string
  slug: string
  face_region: string | null
}

interface Props {
  categories: Category[]
}

function groupByZone(categories: Category[]): Map<string, Category[]> {
  const map = new Map<string, Category[]>()
  for (const cat of categories) {
    if (!cat.face_region) continue
    const existing = map.get(cat.face_region) ?? []
    map.set(cat.face_region, [...existing, cat])
  }
  return map
}

// ─── Hit-zone wrapper ──────────────────────────────────────────────────────────

interface ZoneHitProps {
  zoneId: string
  active: boolean
  selected: boolean
  hovered: boolean
  reduced: boolean | null
  /** Si true, stopPropagation siempre (aunque inactive) — impide que el click llegue al fallback de rostro */
  blockFallback?: boolean
  onClick: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  children: React.ReactNode
}

function ZoneHit({
  zoneId, active, selected, hovered, reduced, blockFallback = false,
  onClick, onKeyDown, onMouseEnter, onMouseLeave, children,
}: ZoneHitProps) {
  const label = getFaceRegionLabel(zoneId)
  return (
    <g
      id={`zone-${zoneId}`}
      role={active ? 'button' : undefined}
      tabIndex={active ? 0 : -1}
      aria-label={active ? `Ver categorías de ${label}` : undefined}
      aria-pressed={selected ? true : undefined}
      onClick={
        active
          ? (e) => { e.stopPropagation(); onClick() }
          : blockFallback
            ? (e) => e.stopPropagation()   // zona inactiva pero bloquea el fallback de rostro
            : undefined
      }
      onKeyDown={active ? onKeyDown : undefined}
      onMouseEnter={active ? onMouseEnter : undefined}
      onMouseLeave={active ? onMouseLeave : undefined}
      style={{
        cursor: active ? 'pointer' : 'default',
        fill: 'var(--color-accent)',
        opacity: !active ? 0 : selected ? 0.40 : hovered ? 0.24 : 0,
        transition: reduced ? 'none' : 'opacity 0.15s ease',
        outline: 'none',
      }}
    >
      {children}
    </g>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function FaceMap({ categories }: Props) {
  const prefersReduced = useReducedMotion()
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)

  const byZone = groupByZone(categories)

  function hasCategories(id: string) {
    return (byZone.get(id)?.length ?? 0) > 0
  }

  function handleZoneClick(id: string) {
    if (!hasCategories(id)) return
    setSelectedZone((prev) => (prev === id ? null : id))
  }

  function handleKeyDown(e: React.KeyboardEvent, id: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleZoneClick(id)
    }
  }

  function zoneProps(id: string) {
    const active = hasCategories(id)
    return {
      zoneId: id,
      active,
      selected: selectedZone === id,
      hovered: hoveredZone === id,
      reduced: prefersReduced,
      onClick: () => handleZoneClick(id),
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, id),
      onMouseEnter: () => active && setHoveredZone(id),
      onMouseLeave: () => setHoveredZone(null),
    }
  }

  const selectedCategories = selectedZone ? (byZone.get(selectedZone) ?? []) : []
  const selectedLabel = selectedZone ? getFaceRegionLabel(selectedZone) : null

  const transition: Transition = prefersReduced
    ? { duration: 0 }
    : { duration: 0.2, ease: 'easeOut' }

  const rostroActive = hasCategories('rostro')
  const rostroSelected = selectedZone === 'rostro'

  return (
    <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

      <ul className="sr-only" aria-label="Categorías por zona del rostro">
        {FACE_REGIONS.map((region) => {
          const cats = byZone.get(region.id) ?? []
          if (cats.length === 0) return null
          return (
            <li key={region.id}>
              <strong>{region.label}:</strong>{' '}
              {cats.map((c, i) => (
                <span key={c.id}>
                  <Link href={`/catalogo?categoria=${c.slug}`}>{c.name}</Link>
                  {i < cats.length - 1 ? ', ' : ''}
                </span>
              ))}
            </li>
          )
        })}
      </ul>

      {/* ── Mapa facial ─────────────────────────────────────────────── */}
      <div
        className="relative shrink-0 select-none"
        style={{ width: 300, height: 450 }}
        aria-hidden
      >
        {/* Gradiente decorativo detrás de la ilustración */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 70% at 50% 52%, var(--bg-highlight) 0%, transparent 72%)',
          }}
        />
        <Image
          src="/image-removebg-preview.png"
          alt="Ilustración de rostro con zonas de maquillaje"
          fill
          sizes="300px"
          priority
          className="object-contain dark:invert pointer-events-none"
          draggable={false}
        />

        {/*
          SVG overlay viewBox=408×612 (dimensiones reales de la imagen).

          ESTRATEGIA DE EVENTOS:
          - El <svg> tiene onClick → dispara rostro (fallback para cualquier zona sin handler).
          - Zonas con blockFallback=true (ojos, cejas, mejillas, labios) siempre hacen
            stopPropagation, activas o no. Nunca llegan al fallback.
          - Zonas sin blockFallback (frente, nariz): si están activas hacen stopPropagation;
            si están inactivas el click llega al <svg> → rostro.
          - rostro NO tiene ZoneHit; su visual se controla directamente.

          Coordenadas calibradas (408×612):
            Hairline  y≈ 95   Cejas   y≈185
            Ojos      y≈228   Nariz   y≈310
            Labios    y≈360   Mentón  y≈420
        */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 408 612"
          aria-label="Mapa facial interactivo"
          onClick={() => handleZoneClick('rostro')}
          onMouseEnter={() => rostroActive && setHoveredZone('rostro')}
          onMouseLeave={() => setHoveredZone(null)}
          style={{ cursor: rostroActive ? 'pointer' : 'default' }}
        >
          <title>Mapa facial Vèloire</title>

          {/* ── Rostro — visual overlay, sin ZoneHit ────────────────── */}
          {/*
            El click lo maneja el <svg> padre.
            pointer-events="none" para que no intercepte eventos de las zonas hijas.
          */}
          {rostroActive && (
            <ellipse
              cx="204" cy="245" rx="116" ry="185"
              fill="var(--color-accent)"
              pointerEvents="none"
              opacity={rostroSelected ? 0.36 : hoveredZone === 'rostro' ? 0.18 : 0}
              style={{ transition: prefersReduced ? 'none' : 'opacity 0.15s ease' }}
            />
          )}

          {/* ── Frente — sin blockFallback; si inactive → click pasa a rostro */}
          <ZoneHit {...zoneProps('frente')}>
            <ellipse cx="204" cy="132" rx="82" ry="38" />
          </ZoneHit>

          {/* ── Nariz — sin blockFallback; si inactive → click pasa a rostro */}
          <ZoneHit {...zoneProps('nariz')}>
            <ellipse cx="204" cy="310" rx="34" ry="38" />
          </ZoneHit>

          {/* ── Zonas "excepción" — blockFallback=true: nunca disparan rostro ── */}

          <ZoneHit {...zoneProps('mejillas')} blockFallback>
            <ellipse cx="110" cy="278" rx="54" ry="44" />
            <ellipse cx="298" cy="278" rx="54" ry="44" />
          </ZoneHit>

          <ZoneHit {...zoneProps('cejas')} blockFallback>
            <ellipse cx="143" cy="184" rx="58" ry="19" />
            <ellipse cx="265" cy="184" rx="58" ry="19" />
          </ZoneHit>

          <ZoneHit {...zoneProps('ojos')} blockFallback>
            <ellipse cx="143" cy="228" rx="58" ry="26" />
            <ellipse cx="265" cy="228" rx="58" ry="26" />
          </ZoneHit>

          <ZoneHit {...zoneProps('labios')} blockFallback>
            <ellipse cx="204" cy="360" rx="62" ry="28" />
          </ZoneHit>
        </svg>
      </div>

      {/* ── Panel de categorías ─────────────────────────────────────── */}
      <div className="flex-1 w-full">
        <AnimatePresence mode="wait">
          {selectedZone && selectedCategories.length > 0 ? (
            <motion.div
              key={selectedZone}
              initial={{ opacity: 0, y: prefersReduced ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: prefersReduced ? 0 : -6 }}
              transition={transition}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-0.75 h-8 bg-accent" />
                  <h3 className="font-display text-2xl text-fg">{selectedLabel}</h3>
                </div>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="p-1.5 rounded-lg text-fg-3 hover:text-fg hover:bg-card transition-colors"
                  aria-label="Cerrar panel"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="space-y-2.5">
                {selectedCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/catalogo?categoria=${cat.slug}`}
                    className="flex items-center justify-between group px-5 py-4 rounded-2xl border border-rim bg-card hover:border-accent hover:bg-highlight transition-all duration-150"
                  >
                    <span className="font-display text-[17px] text-fg group-hover:text-accent transition-colors">
                      {cat.name}
                    </span>
                    <span className="text-fg-3 group-hover:text-accent transition-colors" aria-hidden>
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transition}
            >
              <p className="font-display text-2xl md:text-3xl text-fg mb-2 leading-tight">
                Elige una zona
              </p>
              <p className="font-body text-sm text-fg-3 mb-7 leading-relaxed">
                Toca el rostro o selecciona una zona para descubrir los productos.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {FACE_REGIONS.filter((r) => hasCategories(r.id)).map((region) => (
                  <button
                    key={region.id}
                    onClick={() => handleZoneClick(region.id)}
                    onMouseEnter={() => setHoveredZone(region.id)}
                    onMouseLeave={() => setHoveredZone(null)}
                    className="group flex items-center justify-between px-5 py-4 rounded-2xl border border-rim bg-card hover:border-accent hover:bg-highlight transition-all duration-150 text-left focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <span className="font-display text-[17px] text-fg group-hover:text-accent transition-colors">
                      {region.label}
                    </span>
                    <span className="text-fg-3 group-hover:text-accent transition-colors text-sm" aria-hidden>
                      →
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
