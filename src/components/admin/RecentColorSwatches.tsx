'use client'

// Tira de colores ya usados en otros tonos — clic para reutilizarlo en vez de
// escribir el hex a mano. Puramente presentacional: quien la usa se encarga
// de pedir la lista (getRecentShadeColors) y de aplicar el color elegido.
export function RecentColorSwatches({
  colors,
  current,
  onPick,
}: {
  colors: string[]
  current?: string
  onPick: (hex: string) => void
}) {
  if (colors.length === 0) return null

  return (
    <div>
      <p className="font-body text-xs text-fg-3 mb-1.5">Usados antes:</p>
      <div className="flex flex-wrap gap-1.5">
        {colors.map((hex) => (
          <button
            key={hex}
            type="button"
            title={hex}
            onClick={() => onPick(hex)}
            className={`w-6 h-6 rounded-full border shrink-0 transition-transform hover:scale-110 ${
              current?.toUpperCase() === hex ? 'border-accent ring-2 ring-accent/40' : 'border-rim'
            }`}
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>
    </div>
  )
}
