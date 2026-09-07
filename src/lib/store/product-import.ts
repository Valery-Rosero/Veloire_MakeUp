import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImportShade {
  id: string
  excelRef: string   // referencia original del Excel (ej. "Ref 1")
  name: string        // nombre editable
  hexColor: string
  imageUrl: string
  stock: number
}

export interface ImportProduct {
  id: string
  // Del Excel
  sku: string
  isExisting: boolean   // true = actualiza un producto ya existente (match por SKU)
  marca: string
  nombre: string
  descripcion: string
  costoUnitario: number
  categoryId: string
  categorySlug: string
  comparison: Record<string, string>
  shades: ImportShade[]
  // Paso 2 — admin revisa/edita
  precioVenta: string
  isFeatured: boolean
  // Paso 3
  mainImageUrl: string
  noColorVariation: boolean
  // Paso 4
  publishStatus: 'active' | 'draft'
}

export interface Category {
  id: string
  name: string
  slug: string
  sku_prefix: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function isStep2Complete(p: ImportProduct): boolean {
  const price = parseFloat(p.precioVenta)
  return !isNaN(price) && price > 0
}

export function isStep3Complete(p: ImportProduct): boolean {
  return p.shades.every((s) => s.name.trim().length > 0)
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface ProductImportState {
  step: 1 | 2 | 3 | 4
  products: ImportProduct[]
  productIdx: number

  setStep: (s: 1 | 2 | 3 | 4) => void
  setProducts: (ps: ImportProduct[]) => void
  setProductIdx: (i: number) => void
  updateProduct: (id: string, changes: Partial<ImportProduct>) => void
  updateShade: (productId: string, shadeId: string, changes: Partial<ImportShade>) => void
  reset: () => void
}

const initialState = {
  step: 1 as const,
  products: [] as ImportProduct[],
  productIdx: 0,
}

export const useProductImportStore = create<ProductImportState>()(
  persist(
    (set) => ({
      ...initialState,

      setStep: (step) => set({ step, productIdx: 0 }),

      setProducts: (products) => set({ products, step: 2, productIdx: 0 }),

      setProductIdx: (productIdx) => set({ productIdx }),

      updateProduct: (id, changes) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...changes } : p)),
        })),

      updateShade: (productId, shadeId, changes) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id !== productId
              ? p
              : {
                  ...p,
                  shades: p.shades.map((s) => (s.id === shadeId ? { ...s, ...changes } : s)),
                }
          ),
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'veloire-product-import',
      partialize: (state) => ({
        step: state.step,
        products: state.products,
        productIdx: state.productIdx,
      }),
    }
  )
)
