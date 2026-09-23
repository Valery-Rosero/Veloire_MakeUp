'use client'

import { useRef } from 'react'
import { Camera, Eye, EyeOff, Trash2 } from 'lucide-react'
import { useClickOutside } from '@/hooks/useClickOutside'
import { ImageUploader } from './ImageUploader'
import { RecentColorSwatches } from './RecentColorSwatches'

export interface ShadeSwatchData {
  id?: string
  name: string
  hex_color: string
  stock: number
  image_url: string
  is_active: boolean
  sort_order: number
}

type PopoverKind = 'color' | 'photo' | null

// Un tono como un círculo de color editable en el sitio, en vez de abrir un
// formulario aparte para cada campo — nombre y stock se editan inline, color
// y foto se editan en un popover chiquito que se abre sobre el mismo círculo.
export function ShadeSwatch({
  shade,
  openPopover,
  recentColors,
  onTogglePopover,
  onClosePopover,
  onUpdate,
  onRemove,
}: {
  shade: ShadeSwatchData
  openPopover: PopoverKind
  recentColors: string[]
  onTogglePopover: (kind: 'color' | 'photo') => void
  onClosePopover: () => void
  onUpdate: (patch: Partial<ShadeSwatchData>) => void
  onRemove: () => void
}) {
  const popoverRef = useRef<HTMLDivElement>(null)
  useClickOutside(popoverRef, onClosePopover)

  return (
    <div className="relative flex flex-col items-center gap-1 w-19">
      <button
        type="button"
        onClick={() => onTogglePopover('color')}
        title="Cambiar color"
        className="w-11 h-11 rounded-full border-2 border-rim shrink-0 transition-transform hover:scale-105"
        style={{ backgroundColor: shade.hex_color, opacity: shade.is_active ? 1 : 0.35 }}
      />

      <input
        type="text"
        value={shade.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        placeholder="Nombre"
        className="w-full text-center text-xs font-body text-fg bg-transparent border-b border-transparent hover:border-rim focus:border-accent outline-none py-0.5"
      />

      <input
        type="number"
        min={0}
        value={shade.stock}
        onChange={(e) => onUpdate({ stock: Math.max(0, parseInt(e.target.value, 10) || 0) })}
        title="Stock"
        className="w-full text-center text-[11px] font-body text-fg-2 bg-transparent border-b border-transparent hover:border-rim focus:border-accent outline-none py-0.5"
      />

      <div className="flex items-center gap-1.5 text-fg-3">
        <button
          type="button"
          onClick={() => onTogglePopover('photo')}
          title="Foto del tono"
          className={`hover:text-accent transition-colors ${shade.image_url ? 'text-accent' : ''}`}
        >
          <Camera size={12} />
        </button>
        <button
          type="button"
          onClick={() => onUpdate({ is_active: !shade.is_active })}
          title={shade.is_active ? 'Desactivar tono' : 'Activar tono'}
          className="hover:text-fg transition-colors"
        >
          {shade.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
        <button
          type="button"
          onClick={onRemove}
          title="Eliminar tono"
          className="hover:text-error transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {openPopover === 'color' && (
        <div
          ref={popoverRef}
          className="absolute top-full mt-2 z-20 w-56 bg-card border border-rim rounded-xl p-3 shadow-lg space-y-2"
        >
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={shade.hex_color}
              onChange={(e) => onUpdate({ hex_color: e.target.value })}
              className="w-9 h-9 rounded-lg border border-rim cursor-pointer bg-card shrink-0"
            />
            <input
              type="text"
              value={shade.hex_color}
              onChange={(e) => onUpdate({ hex_color: e.target.value })}
              className="flex-1 min-w-0 rounded-lg border border-rim px-2 py-1.5 text-xs font-mono bg-page text-fg outline-none focus:border-accent"
            />
          </div>
          <RecentColorSwatches
            colors={recentColors}
            current={shade.hex_color}
            onPick={(hex) => onUpdate({ hex_color: hex })}
          />
        </div>
      )}

      {openPopover === 'photo' && (
        <div
          ref={popoverRef}
          className="absolute top-full mt-2 z-20 w-56 bg-card border border-rim rounded-xl p-3 shadow-lg"
        >
          <ImageUploader
            value={shade.image_url}
            onChange={(url) => onUpdate({ image_url: url })}
            hint="Si no subes foto, se usa la imagen principal."
            size="sm"
          />
        </div>
      )}
    </div>
  )
}
