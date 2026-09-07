export const BASE_COLUMNS = [
  'SKU',
  'Marca',
  'Nombre',
  'Descripción',
  'Tono / Referencia',
  'Cantidad',
  'Precio de venta (COP)',
  'Costo unitario',
] as const

export interface ImportValidationError {
  sheet: string
  row: number
  column: string
  value: string
  allowed: string[]
}

export interface ParsedImportGroup {
  sku: string
  marca: string
  nombre: string
  descripcion: string
  costoUnitario: number
  precioVenta: string
  categoryId: string
  categorySlug: string
  comparison: Record<string, string>
  shades: Array<{ excelRef: string; stock: number }>
}

export interface ParseResult {
  groups: ParsedImportGroup[]
  errors: ImportValidationError[]
}
