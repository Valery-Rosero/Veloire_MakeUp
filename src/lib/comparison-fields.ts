export type FieldType = 'select' | 'boolean' | 'text'

export interface ComparisonFieldDef {
  key: string
  label: string
  type: FieldType
  options?: string[]
}

export const UNIVERSAL_FIELDS: ComparisonFieldDef[] = [
  { key: 'tipo_de_piel', label: 'Tipo de piel', type: 'select', options: ['Grasa', 'Seca', 'Mixta', 'Normal', 'Todo tipo'] },
  { key: 'apto_piel_sensible', label: 'Apto piel sensible', type: 'boolean' },
  { key: 'duracion', label: 'Duración', type: 'select', options: ['4h', '6h', '8h', '12h+'] },
  { key: 'resistente_al_agua', label: 'Resistente al agua', type: 'boolean' },
  { key: 'libre_crueldad_animal', label: 'Libre de crueldad animal', type: 'boolean' },
  { key: 'vegano', label: 'Vegano', type: 'boolean' },
  { key: 'ingredientes_clave', label: 'Ingredientes clave', type: 'text' },
]

export const CATEGORY_FIELDS: Record<string, ComparisonFieldDef[]> = {
  labiales: [
    { key: 'efecto', label: 'Efecto', type: 'select', options: ['Hidratante', 'Matificante', 'Voluminizador'] },
    { key: 'transferible', label: 'Transferible', type: 'boolean' },
  ],
  bases: [
    { key: 'cobertura', label: 'Cobertura', type: 'select', options: ['Ligera', 'Media', 'Alta', 'Total'] },
    { key: 'control_de_brillo', label: 'Control de brillo', type: 'boolean' },
    { key: 'fps', label: 'FPS', type: 'select', options: ['Sin FPS', 'FPS 15', 'FPS 30', 'FPS 50+'] },
  ],
  sombras: [
    { key: 'pigmentacion', label: 'Pigmentación', type: 'select', options: ['Baja', 'Media', 'Alta'] },
    { key: 'formato', label: 'Formato', type: 'select', options: ['Individual', 'Paleta'] },
    { key: 'acabado', label: 'Acabado', type: 'select', options: ['Mate', 'Shimmer', 'Metálico', 'Satinado'] },
  ],
  rubores: [
    { key: 'formato', label: 'Formato', type: 'select', options: ['Polvo', 'Crema', 'Líquido'] },
    { key: 'efecto', label: 'Efecto', type: 'select', options: ['Natural', 'Glow', 'Intenso'] },
  ],
  iluminadores: [
    { key: 'formato', label: 'Formato', type: 'select', options: ['Polvo', 'Crema', 'Líquido', 'Barra'] },
    { key: 'intensidad_de_brillo', label: 'Intensidad de brillo', type: 'select', options: ['Sutil', 'Medio', 'Intenso'] },
  ],
  fijadores: [
    { key: 'acabado', label: 'Acabado', type: 'select', options: ['Mate', 'Natural', 'Brillante'] },
  ],
  cejas: [
    { key: 'formato', label: 'Formato', type: 'select', options: ['Lápiz', 'Gel', 'Polvo', 'Pomada'] },
    { key: 'grosor_de_punta', label: 'Grosor de punta', type: 'select', options: ['Fina', 'Biselada', 'N/A'] },
  ],
  otros: [],
}

export function getFieldsForCategory(categorySlug: string): ComparisonFieldDef[] {
  if (categorySlug === 'otros') return []
  const extra = CATEGORY_FIELDS[categorySlug] ?? []
  const extraKeys = new Set(extra.map((f) => f.key))
  return [...UNIVERSAL_FIELDS.filter((f) => !extraKeys.has(f.key)), ...extra]
}

// Para el comparador entre categorías distintas: solo los campos que comparten todas.
export function getCommonFields(categorySlugs: string[]): ComparisonFieldDef[] {
  const perCategory = categorySlugs.map(getFieldsForCategory)
  if (perCategory.length === 0) return []
  const [first, ...rest] = perCategory
  return first.filter((f) => rest.every((fs) => fs.some((f2) => f2.key === f.key)))
}

export function booleanOptions(): string[] {
  return ['Sí', 'No']
}

export function optionsForField(field: ComparisonFieldDef): string[] {
  return field.type === 'boolean' ? booleanOptions() : field.options ?? []
}

export function validateComparisonValue(field: ComparisonFieldDef, raw: string): string | null {
  if (field.type === 'text' || !raw) return null
  const allowed = optionsForField(field)
  return allowed.includes(raw) ? null : `Valor "${raw}" no permitido. Debe ser uno de: ${allowed.join(', ')}`
}
