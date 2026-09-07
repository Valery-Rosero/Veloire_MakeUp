export interface ProductImage {
  url: string
  alt_text: string | null
  is_main: boolean
}

export interface ProductShade {
  id: string
  name: string
  hex_color: string
  image_url: string | null
  stock: number
  is_active: boolean
  sort_order: number
}

export interface ProductDetail {
  id: string
  category_id: string
  name: string
  slug: string
  sku: string
  description: string | null
  comparison: Record<string, string> | null
  price: number
  compare_price: number | null
  meta_title: string | null
  meta_description: string | null
  product_images: ProductImage[]
  product_shades: ProductShade[]
  categories: { name: string; slug: string } | null
}
