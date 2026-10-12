// Donut chart con conic-gradient (sin librería externa).
// Acepta un array de segmentos con valor, color y etiqueta.

export interface DonutSegment {
  label: string
  value: number
  color: string
}

export function DonutChart({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: DonutSegment[]
  centerLabel?: string
  centerValue?: string | number
}) {
  const total = segments.reduce((s, x) => s + x.value, 0)

  // Ángulos acumulados sin mutar una variable externa al loop (el React
  // Compiler no permite reasignar algo fuera del callback durante el render).
  const stops = segments
    .filter(s => s.value > 0)
    .reduce<{ parts: string[]; angle: number }>(
      (acc, seg) => {
        const pct = (seg.value / Math.max(total, 1)) * 360
        const end = acc.angle + pct
        return {
          parts: [...acc.parts, `${seg.color} ${acc.angle.toFixed(1)}deg ${end.toFixed(1)}deg`],
          angle: end,
        }
      },
      { parts: [], angle: 0 }
    )
    .parts.join(', ')

  const gradient = stops.length
    ? `conic-gradient(${stops})`
    : 'conic-gradient(var(--bg-alt) 0deg 360deg)'

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Donut */}
      <div className="relative w-28 h-28 shrink-0">
        <div className="w-full h-full rounded-full" style={{ background: gradient }} />
        {/* Hole */}
        <div
          className="absolute inset-[22%] rounded-full flex flex-col items-center justify-center"
          style={{ background: 'var(--bg-card)' }}
        >
          {centerValue !== undefined && (
            <p className="font-display text-lg text-fg leading-none">{centerValue}</p>
          )}
          {centerLabel && (
            <p className="font-body text-[9px] text-fg-3 leading-tight text-center">{centerLabel}</p>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="w-full space-y-1.5">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="font-body text-xs text-fg-2 truncate">{seg.label}</span>
            </div>
            <span className="font-body text-xs font-medium text-fg shrink-0">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
