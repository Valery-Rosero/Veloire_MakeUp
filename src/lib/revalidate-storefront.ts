import { revalidatePath, revalidateTag } from 'next/cache'

// Invalida todo lo que depende de productos/tonos/stock: el caché de
// unstable_cache del catálogo (tag 'products') y las páginas estáticas de
// producto (generateStaticParams + ISR) — sin necesidad de saber qué SKU
// específico cambió, ya que a esta escala revalidar todas las fichas de
// producto es barato. Se llama desde cualquier mutación de products,
// product_shades o product_images (admin, importador Excel, checkout,
// cancelación/restauración de stock).
export function revalidateCatalog() {
  // profile 'max' = stale-while-revalidate (recomendado por Next 16): sirve
  // lo último cacheado mientras refresca en segundo plano, en vez de bloquear
  // la siguiente visita con un cache miss. El single-arg revalidateTag(tag)
  // está deprecado desde Next 16.
  revalidateTag('products', 'max')
  revalidatePath('/')
  revalidatePath('/catalogo')
  revalidatePath('/(store)/producto/[slug]', 'page')
}

// Igual que revalidateCatalog(), pero para cambios en categories: afecta
// las píldoras de filtro del catálogo y el FaceMap de la home.
export function revalidateCategories() {
  revalidateTag('categories', 'max')
  revalidatePath('/catalogo')
  revalidatePath('/')
}
