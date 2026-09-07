import * as XLSX from 'xlsx'
import { getFieldsForCategory, optionsForField, validateComparisonValue } from '@/lib/comparison-fields'
import type { ParseResult, ParsedImportGroup, ImportValidationError } from './types'

interface CategoryRef {
  id: string
  name: string
  slug: string
}

export async function readWorkbookSheets(
  file: File
): Promise<{ sheets: Record<string, Record<string, unknown>[]>; error?: string }> {
  if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
    return { sheets: {}, error: 'Formato no soportado. Usa .xlsx, .xls o .csv' }
  }
  if (file.size > 10 * 1024 * 1024) {
    return { sheets: {}, error: 'El archivo supera el límite de 10MB' }
  }
  try {
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const sheets: Record<string, Record<string, unknown>[]> = {}
    for (const sheetName of wb.SheetNames) {
      const ws = wb.Sheets[sheetName]
      sheets[sheetName] = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
    }
    if (Object.keys(sheets).length === 0) {
      return { sheets: {}, error: 'El archivo no tiene hojas.' }
    }
    return { sheets }
  } catch {
    return { sheets: {}, error: 'No se pudo leer el archivo. Asegúrate de que sea un Excel válido.' }
  }
}

function norm(s: string): string {
  return String(s).trim().toLowerCase()
}

// Agrupa filas por SKU (o marca+nombre si no hay SKU aún), con carry-forward
// para celdas combinadas — igual que el importador anterior, extendido a SKU
// y a los campos de comparación (son por-producto, no por-tono).
export function parseWorkbook(
  sheets: Record<string, Record<string, unknown>[]>,
  categories: CategoryRef[]
): ParseResult {
  const groups: ParsedImportGroup[] = []
  const errors: ImportValidationError[] = []

  for (const [sheetName, rows] of Object.entries(sheets)) {
    const category = categories.find((c) => norm(c.name) === norm(sheetName))
    if (!category || rows.length === 0) continue

    const fields = getFieldsForCategory(category.slug)
    const byGroupKey = new Map<string, ParsedImportGroup>()
    const invalidGroupKeys = new Set<string>()

    let lastSku = ''
    let lastMarca = ''
    let lastNombre = ''
    let lastDescripcion = ''
    let lastCosto = 0
    let lastPrecio = ''
    let lastComparison: Record<string, string> = {}

    rows.forEach((row, i) => {
      const rowNumber = i + 2 // fila 1 = encabezados

      const rawSku = String(row['SKU'] ?? '').trim().toUpperCase()
      const sku = rawSku || lastSku
      if (rawSku) lastSku = rawSku

      const rawMarca = String(row['Marca'] ?? '').trim()
      const marca = rawMarca || lastMarca
      if (rawMarca) lastMarca = rawMarca

      const rawNombre = String(row['Nombre'] ?? '').trim()
      const nombre = rawNombre || lastNombre
      if (!nombre) return // fila vacía
      if (rawNombre) lastNombre = rawNombre

      const rawDescripcion = String(row['Descripción'] ?? '').trim()
      const descripcion = rawDescripcion || lastDescripcion
      if (rawDescripcion) lastDescripcion = rawDescripcion

      const rawCosto = Number(row['Costo unitario'] ?? 0)
      const costoUnitario = rawCosto > 0 ? rawCosto : lastCosto
      if (rawCosto > 0) lastCosto = rawCosto

      const rawPrecio = String(row['Precio de venta (COP)'] ?? '').trim()
      const precioVenta = rawPrecio || lastPrecio
      if (rawPrecio) lastPrecio = rawPrecio

      const groupKey = sku || `${marca}::${nombre}`.toLowerCase()

      const comparison: Record<string, string> = { ...lastComparison }
      for (const f of fields) {
        const raw = String(row[f.label] ?? '').trim()
        if (raw) {
          comparison[f.key] = raw
          const err = validateComparisonValue(f, raw)
          if (err) {
            invalidGroupKeys.add(groupKey)
            errors.push({ sheet: sheetName, row: rowNumber, column: f.label, value: raw, allowed: optionsForField(f) })
          }
        }
      }
      lastComparison = comparison

      if (!byGroupKey.has(groupKey)) {
        byGroupKey.set(groupKey, {
          sku,
          marca,
          nombre,
          descripcion,
          costoUnitario,
          precioVenta,
          categoryId: category.id,
          categorySlug: category.slug,
          comparison,
          shades: [],
        })
      }

      const group = byGroupKey.get(groupKey)!
      if (marca) group.marca = marca
      if (descripcion) group.descripcion = descripcion
      if (costoUnitario > 0) group.costoUnitario = costoUnitario
      if (precioVenta) group.precioVenta = precioVenta
      Object.assign(group.comparison, comparison)

      const ref = String(row['Tono / Referencia'] ?? '').trim()
      const rawStock = Number(row['Cantidad'] ?? 1)
      const stock = isNaN(rawStock) ? 1 : Math.max(0, Math.floor(rawStock))
      if (ref) group.shades.push({ excelRef: ref, stock })
    })

    for (const [key, group] of byGroupKey) {
      if (!invalidGroupKeys.has(key)) groups.push(group)
    }
  }

  return { groups, errors }
}
