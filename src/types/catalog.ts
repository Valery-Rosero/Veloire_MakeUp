export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  face_region?: string | null
}

export interface CatalogoProduct {
  id: string
  slug: string
  name: string
  price: number
  compare_price: number | null
  product_images: Array<{ url: string; alt_text: string | null; is_main: boolean }>
  product_shades: Array<{ id: string; is_active: boolean; stock: number }>
  categories: { name: string; slug: string } | null
}

export interface ProductRow {
  id: string
  name: string
  slug: string
  status: 'draft' | 'active' | 'inactive'
  price: number
  is_featured: boolean
  categories: { name: string } | null
  product_shades: Array<{ id: string; stock: number; is_active: boolean }>
  product_images: Array<{ url: string; is_main: boolean }>
}
