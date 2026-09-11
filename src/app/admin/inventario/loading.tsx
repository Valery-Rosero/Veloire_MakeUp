function InventoryRowSkeleton() {
  return (
    <tr className="border-b border-rim last:border-0">
      <td className="px-5 py-3.5">
        <div className="w-4 h-4 rounded bg-alt animate-pulse" />
      </td>
      <td className="px-3 py-3.5">
        <div className="h-4 w-40 rounded-md bg-alt animate-pulse" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-4 w-24 rounded-md bg-alt animate-pulse" />
      </td>
      <td className="px-4 py-3.5 text-center">
        <div className="h-5 w-16 rounded-full bg-alt animate-pulse mx-auto" />
      </td>
      <td className="px-4 py-3.5 text-right">
        <div className="h-4 w-12 rounded-md bg-alt animate-pulse ml-auto" />
      </td>
    </tr>
  )
}

export default function InventarioLoading() {
  return (
    <div>
      <div className="h-8 w-32 rounded-lg bg-alt animate-pulse mb-6" />
      <div className="bg-card border border-rim rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <InventoryRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
