import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/cuenta/ProfileForm'
import { SignOutButton } from '@/components/cuenta/SignOutButton'
import { formatPrice, formatDate } from '@/lib/format'
import type { OrderStatus } from '@/types/database'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Pago pendiente',
  paid: 'Pago confirmado',
  preparing: 'En preparación',
  shipped: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending_payment: 'bg-warning/15 text-warning',
  paid: 'bg-success/15 text-success',
  preparing: 'bg-accent/15 text-accent',
  shipped: 'bg-accent/15 text-accent',
  delivered: 'bg-success/15 text-success',
  cancelled: 'bg-error/15 text-error',
}

interface OrderRow {
  id: string
  order_number: string
  status: OrderStatus
  total: number
  created_at: string
  item_count: number
}

const PAGE_SIZE = 10

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function CuentaPage({ searchParams }: PageProps) {
  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? '1', 10))
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectTo=/cuenta')

  const [profileResult, ordersResult] = await Promise.all([
    supabase.from('profiles').select('full_name, phone').eq('id', user.id).limit(1),
    supabase
      .from('v_orders_detail')
      .select('id, order_number, status, total, created_at, item_count', { count: 'exact' })
      .eq('customer_email', user.email!)
      .order('created_at', { ascending: false })
      .range(from, to),
  ])

  const profile = (profileResult.data as Array<{ full_name: string | null; phone: string | null }> | null)?.[0]
  const orders = (ordersResult.data as OrderRow[] | null) ?? []
  const totalPages = Math.ceil((ordersResult.count ?? 0) / PAGE_SIZE)

  return (
    <main className="container mx-auto px-4 py-10 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl text-fg leading-snug">
            Hola, {profile?.full_name?.split(' ')[0] ?? 'bienvenida'}
          </h1>
          <p className="font-body text-sm text-fg-2 mt-1">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      {/* Profile section */}
      <section className="mb-10">
        <h2 className="font-display text-lg text-fg mb-4">Mis datos</h2>
        <div className="bg-card border border-rim rounded-2xl p-6">
          <ProfileForm
            userId={user.id}
            initialName={profile?.full_name ?? ''}
            initialPhone={profile?.phone ?? ''}
          />
        </div>
      </section>

      {/* Orders section */}
      <section>
        <h2 className="font-display text-lg text-fg mb-4">Mis pedidos</h2>

        {orders.length === 0 ? (
          <div className="bg-card border border-rim rounded-2xl p-10 text-center">
            <Package size={32} className="text-fg-3 mx-auto mb-3" />
            <p className="font-body text-sm text-fg-2 mb-4">Aún no tienes pedidos.</p>
            <Link
              href="/catalogo"
              className="inline-flex px-5 py-2.5 rounded-xl bg-noir text-beige text-sm font-body font-medium hover:opacity-90 transition-opacity"
            >
              Explorar productos
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/pedido/${order.order_number}`}
                className="flex items-center justify-between bg-card border border-rim rounded-2xl px-5 py-4 hover:border-rim-2 transition-colors group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-body text-sm font-medium text-fg">
                      #{order.order_number}
                    </span>
                    <span
                      className={`text-[11px] font-body font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <p className="font-body text-xs text-fg-3">
                    {order.item_count} {order.item_count === 1 ? 'producto' : 'productos'} · {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="font-body text-sm font-medium text-fg">
                    {formatPrice(order.total)}
                  </span>
                  <svg
                    className="text-fg-3 group-hover:text-fg transition-colors"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/cuenta?page=${p}`}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-body transition-colors ${
                  p === currentPage
                    ? 'bg-noir text-beige'
                    : 'bg-card border border-rim text-fg-2 hover:border-rim-2'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
