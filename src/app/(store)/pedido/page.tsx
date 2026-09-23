import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  searchParams: Promise<{ numero?: string; correo?: string }>
}

export default async function PedidoSearchPage({ searchParams }: PageProps) {
  const { numero, correo } = await searchParams

  let error: string | null = null

  if (numero && correo) {
    try {
      const supabase = await createClient()
      const { data: rows } = await supabase
        .from('orders')
        .select('order_number')
        .eq('order_number', numero.trim().toUpperCase())
        .eq('customer_email', correo.trim().toLowerCase())
        .limit(1)

      const found = (rows as Array<{ order_number: string }> | null)?.[0]
      if (found) {
        redirect(`/pedido/${found.order_number}`)
      } else {
        error = 'No encontramos un pedido con esos datos.'
      }
    } catch {
      error = 'Ocurrió un error al buscar el pedido. Inténtalo de nuevo.'
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-full bg-highlight flex items-center justify-center mx-auto mb-4">
          <Search size={22} className="text-accent" />
        </div>
        <h1 className="font-display text-2xl text-fg mb-2">Buscar mi pedido</h1>
        <p className="font-body text-sm text-fg-2">
          Ingresa tu número de orden y el correo que usaste al comprar.
        </p>
      </div>

      <form method="GET" action="/pedido" className="space-y-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="numero" className="text-sm font-body font-medium text-fg-2">
            Número de orden
          </label>
          <input
            id="numero"
            name="numero"
            type="text"
            defaultValue={numero ?? ''}
            placeholder="VEL-20250610-00042"
            autoComplete="off"
            className="w-full rounded-lg border border-rim px-3 py-2 text-sm bg-card text-fg outline-none transition-colors duration-150 placeholder:text-fg-2 focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="correo" className="text-sm font-body font-medium text-fg-2">
            Correo electrónico
          </label>
          <input
            id="correo"
            name="correo"
            type="email"
            defaultValue={correo ?? ''}
            placeholder="tucorreo@ejemplo.com"
            autoComplete="email"
            className="w-full rounded-lg border border-rim px-3 py-2 text-sm bg-card text-fg outline-none transition-colors duration-150 placeholder:text-fg-2 focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        {error && (
          <p className="text-sm font-body text-error bg-error/10 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
        >
          Buscar mi pedido
        </button>
      </form>

      <p className="text-center text-xs font-body text-fg-3 mt-6">
        ¿No tienes un número de orden?{' '}
        <Link href="/catalogo" className="text-accent hover:underline underline-offset-4">
          Explorar la tienda
        </Link>
      </p>
    </main>
  )
}
