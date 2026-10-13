import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const MAX_COMPARE = 4
const LIMIT_NOTICE_MS = 2500

interface CompareStore {
  productIds: string[]
  // Se enciende unos segundos cuando alguien intenta agregar un quinto producto,
  // para que la barra lo avise en vez de ignorar el clic en silencio.
  limitNotice: boolean
  // Contador de intentos rechazados: la barra lo usa para repetir la sacudida.
  limitHits: number
  toggle: (id: string) => void
  remove: (id: string) => void
  clear: () => void
}

let limitTimer: ReturnType<typeof setTimeout> | undefined

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      productIds: [],
      limitNotice: false,
      limitHits: 0,
      toggle(id) {
        const { productIds } = get()
        if (productIds.includes(id)) {
          set({ productIds: productIds.filter((x) => x !== id), limitNotice: false })
        } else if (productIds.length < MAX_COMPARE) {
          set({ productIds: [...productIds, id] })
        } else {
          set((s) => ({ limitNotice: true, limitHits: s.limitHits + 1 }))
          clearTimeout(limitTimer)
          limitTimer = setTimeout(() => set({ limitNotice: false }), LIMIT_NOTICE_MS)
        }
      },
      remove(id) {
        set((s) => ({ productIds: s.productIds.filter((x) => x !== id), limitNotice: false }))
      },
      clear() {
        set({ productIds: [], limitNotice: false })
      },
    }),
    {
      name: 'veloire-compare',
      partialize: (s) => ({ productIds: s.productIds }),
    }
  )
)
