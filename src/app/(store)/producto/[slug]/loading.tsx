export default function ProductoLoading() {
  return (
    <main>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[45%_55%]">
          {/* Columna izquierda — imagen */}
          <div
            className="relative overflow-hidden aspect-3/4 md:aspect-auto"
            style={{ backgroundColor: '#1a1a1a' }}
          >
            <div className="hidden md:block" style={{ minHeight: '70vh' }} />
          </div>

          {/* Columna derecha */}
          <div className="flex flex-col gap-5 px-6 py-8 md:px-10 md:py-12 bg-page">
            <div className="h-3 w-24 rounded-md bg-alt animate-pulse" />
            <div className="h-8 w-3/4 rounded-lg bg-alt animate-pulse" />
            <div className="h-7 w-32 rounded-lg bg-alt animate-pulse" />

            <div className="space-y-2">
              <div className="h-4 w-16 rounded-md bg-alt animate-pulse" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-alt animate-pulse" />
                ))}
              </div>
            </div>

            <hr className="border-rim" />

            <div className="h-11 w-full rounded-xl bg-alt animate-pulse" />

            <div className="space-y-2">
              <div className="h-3.5 rounded-md bg-alt animate-pulse w-full" />
              <div className="h-3.5 rounded-md bg-alt animate-pulse w-5/6" />
              <div className="h-3.5 rounded-md bg-alt animate-pulse w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
