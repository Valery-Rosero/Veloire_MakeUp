import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const MAX_COMPARE = 4
const LIMIT_NOTICE_MS = 2500

interface CompareStore {
  productIds: string[]
  // Ventana de comparación (no se persiste: al recargar arranca cerrada).
  // Se cierra sola si quedan menos de 2 productos — no hay nada que comparar.
  isOpen: boolean
  // Se enciende unos segundos cuando alguien intenta agregar un quinto producto,
  // para que la barra lo avise en vez de ignorar el clic en silencio.
  limitNotice: boolean
  // Contador de intentos rechazados: la barra lo usa para repetir la sacudida.
  limitHits: number
  toggle: (id: string) => void
  remove: (id: string) => void
  clear: () => void
  open: () => void
  close: () => void
}

let limitTimer: ReturnType<typeof setTimeout> | undefined

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      productIds: [],
      isOpen: false,
      limitNotice: false,
      limitHits: 0,
      toggle(id) {
        const { productIds, isOpen } = get()
        if (productIds.includes(id)) {
          const next = productIds.filter((x) => x !== id)
          set({ productIds: next, limitNotice: false, isOpen: isOpen && next.length >= 2 })
        } else if (productIds.length < MAX_COMPARE) {
          set({ productIds: [...productIds, id] })
        } else {
          set((s) => ({ limitNotice: true, limitHits: s.limitHits + 1 }))
          clearTimeout(limitTimer)
          limitTimer = setTimeout(() => set({ limitNotice: false }), LIMIT_NOTICE_MS)
        }
      },
      remove(id) {
        set((s) => {
          const next = s.productIds.filter((x) => x !== id)
          return { productIds: next, limitNotice: false, isOpen: s.isOpen && next.length >= 2 }
        })
      },
      clear() {
        set({ productIds: [], limitNotice: false, isOpen: false })
      },
      open() {
        if (get().productIds.length >= 2) set({ isOpen: true })
      },
      close() {
        set({ isOpen: false })
      },
    }),
    {
      name: 'veloire-compare',
      partialize: (s) => ({ productIds: s.productIds }),
    }
  )
)
