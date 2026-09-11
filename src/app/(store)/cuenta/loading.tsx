function OrderRowSkeleton() {
  return (
    <div className="flex items-center justify-between bg-card border border-rim rounded-2xl px-5 py-4">
      <div className="space-y-2">
        <div className="h-4 w-32 rounded-md bg-alt animate-pulse" />
        <div className="h-3 w-40 rounded-md bg-alt animate-pulse" />
      </div>
      <div className="h-4 w-16 rounded-md bg-alt animate-pulse" />
    </div>
  )
}

export default function CuentaLoading() {
  return (
    <main className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-start justify-between mb-10">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-alt animate-pulse" />
          <div className="h-4 w-40 rounded-md bg-alt animate-pulse" />
        </div>
        <div className="h-8 w-24 rounded-lg bg-alt animate-pulse" />
      </div>

      <section className="mb-10">
        <div className="h-5 w-24 rounded-md bg-alt animate-pulse mb-4" />
        <div className="bg-card border border-rim rounded-2xl p-6 space-y-4">
          <div className="h-10 rounded-xl bg-alt animate-pulse" />
          <div className="h-10 rounded-xl bg-alt animate-pulse" />
        </div>
      </section>

      <section>
        <div className="h-5 w-28 rounded-md bg-alt animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <OrderRowSkeleton key={i} />
          ))}
        </div>
      </section>
    </main>
  )
}
