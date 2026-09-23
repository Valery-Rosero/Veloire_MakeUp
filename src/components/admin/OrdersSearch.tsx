'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState } from 'react'

export function OrdersSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(defaultValue)

  function handleChange(q: string) {
    setValue(q)
    const params = new URLSearchParams(searchParams.toString())
    if (q) params.set('q', q)
    else params.delete('q')
    params.delete('page')
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="relative max-w-xs">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-3 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Buscar por orden o cliente..."
        className="w-full rounded-lg border border-rim bg-card text-fg text-sm font-body pl-8 pr-3 py-1.5 outline-none transition-colors placeholder:text-fg-2 hover:border-rim-2 focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </div>
  )
}
