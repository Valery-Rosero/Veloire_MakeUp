export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

// Agrega un sufijo numérico incremental hasta encontrar un slug libre en `existing`,
// y lo reserva en el set para que la siguiente llamada no repita el mismo valor.
export function uniqueSlug(base: string, existing: Set<string>): string {
  let slug = base
  let counter = 2
  while (existing.has(slug)) slug = `${base}-${counter++}`
  existing.add(slug)
  return slug
}

// Prefijo de SKU sugerido a partir de un nombre (ej. de categoría o marca): primeras
// 3 letras en mayúsculas, sin tildes ni caracteres no alfabéticos. Siempre editable.
export function suggestSkuPrefix(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z]/g, '')
    .toUpperCase()
    .slice(0, 3)
}
