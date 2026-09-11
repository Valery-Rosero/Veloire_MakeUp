function OrderListItemSkeleton() {
  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <div className="space-y-1.5">
        <div className="h-4 w-20 rounded-md bg-alt animate-pulse" />
        <div className="h-3 w-36 rounded-md bg-alt animate-pulse" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-4 w-16 rounded-md bg-alt animate-pulse hidden sm:block" />
        <div className="h-5 w-20 rounded-full bg-alt animate-pulse hidden md:block" />
      </div>
    </div>
  )
}

export default function PedidosAdminLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-28 rounded-lg bg-alt animate-pulse" />
        <div className="h-9 w-32 rounded-xl bg-alt animate-pulse" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[72, 96, 88, 84, 92, 80].map((w, i) => (
          <div key={i} className="h-7 rounded-full bg-alt animate-pulse" style={{ width: w }} />
        ))}
      </div>

      <div className="mb-5">
        <div className="h-10 w-full max-w-sm rounded-xl bg-alt animate-pulse" />
      </div>

      <div className="bg-card border border-rim rounded-2xl overflow-hidden divide-y divide-rim">
        {Array.from({ length: 8 }).map((_, i) => (
          <OrderListItemSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
