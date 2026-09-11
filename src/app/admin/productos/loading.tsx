function ProductRowSkeleton() {
  return (
    <div className="grid grid-cols-[48px_1fr] lg:grid-cols-[48px_1fr_auto_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5">
      <div className="w-12 h-12 rounded-lg bg-alt animate-pulse" />
      <div className="space-y-1.5 min-w-0">
        <div className="h-4 w-40 rounded-md bg-alt animate-pulse" />
        <div className="h-3 w-24 rounded-md bg-alt animate-pulse" />
      </div>
      <div className="hidden lg:block h-4 w-20 rounded-md bg-alt animate-pulse" />
      <div className="hidden lg:block h-4 w-16 rounded-md bg-alt animate-pulse" />
      <div className="hidden lg:block h-4 w-12 rounded-md bg-alt animate-pulse" />
      <div className="hidden lg:block h-5 w-16 rounded-full bg-alt animate-pulse" />
      <div className="hidden lg:block h-4 w-16 rounded-md bg-alt animate-pulse" />
    </div>
  )
}

export default function ProductosAdminLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 rounded-lg bg-alt animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 w-36 rounded-xl bg-alt animate-pulse" />
          <div className="h-9 w-32 rounded-xl bg-alt animate-pulse" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex gap-2">
          {[64, 80, 88, 76].map((w, i) => (
            <div key={i} className="h-7 rounded-full bg-alt animate-pulse" style={{ width: w }} />
          ))}
        </div>
        <div className="h-9 w-48 rounded-xl bg-alt animate-pulse" />
      </div>

      <div className="bg-card border border-rim rounded-2xl overflow-hidden divide-y divide-rim">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
