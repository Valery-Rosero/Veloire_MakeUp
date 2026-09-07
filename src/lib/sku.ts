// Abrevia una marca a 4 letras para el SKU: recorta si es larga, rellena con
// X si es corta, y usa 'GEN' (genérico) si el producto no tiene marca.
export function abbreviateBrand(brand: string | null | undefined): string {
  const clean = (brand ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z]/g, '')
    .toUpperCase()
  if (!clean) return 'GEN'
  return clean.length >= 4 ? clean.slice(0, 4) : clean.padEnd(4, 'X')
}

export function buildSku(brand: string | null | undefined, categoryPrefix: string, n: number): string {
  return `${abbreviateBrand(brand)}-${categoryPrefix}-${String(n).padStart(3, '0')}`
}

// Encuentra el siguiente SKU libre para esa combinación marca+categoría
// (mismo espíritu que uniqueSlug en src/lib/slug.ts) y lo reserva en el set.
export function nextSkuForBrandCategory(
  brand: string | null | undefined,
  categoryPrefix: string,
  existingSkus: Set<string>
): string {
  let n = 1
  let sku = buildSku(brand, categoryPrefix, n)
  while (existingSkus.has(sku)) {
    n++
    sku = buildSku(brand, categoryPrefix, n)
  }
  existingSkus.add(sku)
  return sku
}
