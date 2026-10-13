'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion, type Transition } from 'framer-motion'
import { X } from 'lucide-react'
import { FACE_REGIONS, getFaceRegionLabel } from '@/lib/face-regions'
import { RevealGroup, revealVariants } from '@/components/ui/Reveal'

interface Category {
  id: string
  name: string
  slug: string
  face_region: string | null
}

interface Props {
  categories: Category[]
}

// Elipses de cada zona sobre el viewBox 408×612: [cx, cy, rx, ry]. Las usan
// tanto las zonas clicables como el destello de "pista" al aparecer.
const ZONE_SHAPES: Record<string, Array<[number, number, number, number]>> = {
  rostro: [[204, 245, 116, 185]],
  frente: [[204, 132, 82, 38]],
  nariz: [[204, 310, 34, 38]],
  mejillas: [[110, 278, 54, 44], [298, 278, 54, 44]],
  cejas: [[143, 184, 58, 19], [265, 184, 58, 19]],
  ojos: [[143, 228, 58, 26], [265, 228, 58, 26]],
  labios: [[204, 360, 62, 28]],
}

function ZoneShapes({ id }: { id: string }) {
  return (
    <>
      {ZONE_SHAPES[id].map(([cx, cy, rx, ry]) => (
        <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx={rx} ry={ry} />
      ))}
    </>
  )
}

// Orden del destello: de arriba hacia abajo de la cara.
const HINT_ORDER = ['frente', 'cejas', 'ojos', 'nariz', 'mejillas', 'labios']

const EASE_OUT = [0.22, 1, 0.36, 1] as const

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
  const mapRef = useRef<HTMLDivElement>(null)
  const inView = useInView(mapRef, { once: true, margin: '0px 0px -15% 0px' })

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

  // Si solo hay productos de "rostro", destella la cara entera.
  const zonesWithProducts = HINT_ORDER.filter(hasCategories)
  const hintZones = zonesWithProducts.length > 0 ? zonesWithProducts : rostroActive ? ['rostro'] : []

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
      <motion.div
        ref={mapRef}
        className="relative shrink-0 select-none"
        style={{ width: 300, height: 450 }}
        aria-hidden
        initial={{ opacity: 0, scale: 0.94 }}
        animate={inView ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 0.8, ease: EASE_OUT }}
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
          className="object-contain dark:invert dark:brightness-110 dark:contrast-125 dark:drop-shadow-[0_0_14px_rgba(255,255,255,0.3)] pointer-events-none"
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
              cx={ZONE_SHAPES.rostro[0][0]} cy={ZONE_SHAPES.rostro[0][1]}
              rx={ZONE_SHAPES.rostro[0][2]} ry={ZONE_SHAPES.rostro[0][3]}
              fill="var(--color-accent)"
              pointerEvents="none"
              opacity={rostroSelected ? 0.36 : hoveredZone === 'rostro' ? 0.18 : 0}
              style={{ transition: prefersReduced ? 'none' : 'opacity 0.15s ease' }}
            />
          )}

          {/* ── Frente — sin blockFallback; si inactive → click pasa a rostro */}
          <ZoneHit {...zoneProps('frente')}>
            <ZoneShapes id="frente" />
          </ZoneHit>

          {/* ── Nariz — sin blockFallback; si inactive → click pasa a rostro */}
          <ZoneHit {...zoneProps('nariz')}>
            <ZoneShapes id="nariz" />
          </ZoneHit>

          {/* ── Zonas "excepción" — blockFallback=true: nunca disparan rostro ── */}

          <ZoneHit {...zoneProps('mejillas')} blockFallback>
            <ZoneShapes id="mejillas" />
          </ZoneHit>

          <ZoneHit {...zoneProps('cejas')} blockFallback>
            <ZoneShapes id="cejas" />
          </ZoneHit>

          <ZoneHit {...zoneProps('ojos')} blockFallback>
            <ZoneShapes id="ojos" />
          </ZoneHit>

          <ZoneHit {...zoneProps('labios')} blockFallback>
            <ZoneShapes id="labios" />
          </ZoneHit>

          {/* ── Pista al aparecer: cada zona con productos destella una vez,
              de arriba hacia abajo, para mostrar que se pueden tocar ── */}
          {inView && !prefersReduced && (
            <g pointerEvents="none" fill="var(--color-accent)">
              {hintZones.map((id, i) => (
                <motion.g
                  key={id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 1, ease: 'easeInOut', delay: 0.7 + i * 0.22 }}
                >
                  <ZoneShapes id={id} />
                </motion.g>
              ))}
            </g>
          )}
        </svg>
      </motion.div>

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
              <RevealGroup stagger={0.07} delayChildren={0.25} className="grid grid-cols-2 gap-2.5">
                {FACE_REGIONS.filter((r) => hasCategories(r.id)).map((region) => (
                  <motion.button
                    variants={revealVariants.up}
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
                  </motion.button>
                ))}
              </RevealGroup>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
