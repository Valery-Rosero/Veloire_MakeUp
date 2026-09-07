import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const MAX_COMPARE = 4

interface CompareStore {
  productIds: string[]
  toggle: (id: string) => void
  remove: (id: string) => void
  clear: () => void
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle(id) {
        const { productIds } = get()
        if (productIds.includes(id)) {
          set({ productIds: productIds.filter((x) => x !== id) })
        } else if (productIds.length < MAX_COMPARE) {
          set({ productIds: [...productIds, id] })
        }
      },
      remove(id) {
        set((s) => ({ productIds: s.productIds.filter((x) => x !== id) }))
      },
      clear() {
        set({ productIds: [] })
      },
    }),
    {
      name: 'veloire-compare',
      partialize: (s) => ({ productIds: s.productIds }),
    }
  )
)
