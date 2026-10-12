'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { useTheme } from '@/components/ui/ThemeProvider'
import { useHasMounted } from '@/hooks/useHasMounted'

export interface DayRevenue { date: string; value: number }

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.[0]) return null
  return (
    <div
      className="rounded-xl px-3 py-2 shadow-lg border text-xs font-body"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-soft)' }}
    >
      <p style={{ color: 'var(--fg-tertiary)' }} className="mb-0.5">{label}</p>
      <p className="font-semibold" style={{ color: 'var(--accent-rose)' }}>
        ${payload[0].value.toLocaleString('es-CO')}
      </p>
    </div>
  )
}

export function RevenueChart({ data }: { data: DayRevenue[] }) {
  const mounted = useHasMounted()
  const { resolvedTheme } = useTheme()

  const accent = resolvedTheme === 'dark' ? '#c08fa2' : '#a56583'
  const grid   = resolvedTheme === 'dark' ? '#3d2a2a' : '#e8d0c0'
  const label  = resolvedTheme === 'dark' ? '#8a7070' : '#b09090'

  if (!mounted) return <div className="h-52 rounded-xl bg-alt animate-pulse" />

  const hasData = data.some(d => d.value > 0)

  return (
    <ResponsiveContainer width="100%" height={210}>
      <AreaChart data={data} margin={{ top: 6, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor={accent} stopOpacity={0.22} />
            <stop offset="95%" stopColor={accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: label, fontFamily: 'Inter, sans-serif' }}
          tickLine={false} axisLine={false}
          interval={Math.floor(data.length / 6)}
        />
        <YAxis
          tick={{ fontSize: 10, fill: label, fontFamily: 'Inter, sans-serif' }}
          tickLine={false} axisLine={false}
          tickFormatter={v => v === 0 ? '$0' : `$${Math.round(v / 1000)}k`}
          width={42}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: accent, strokeWidth: 1, strokeDasharray: '4 4' }} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={accent}
          strokeWidth={hasData ? 2 : 0}
          fill="url(#revGrad)"
          dot={false}
          activeDot={{ r: 4, fill: accent, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
