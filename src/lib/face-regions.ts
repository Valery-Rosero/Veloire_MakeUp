export interface FaceRegion {
  id: string
  label: string
}

export const FACE_REGIONS: FaceRegion[] = [
  { id: 'frente', label: 'Frente' },
  { id: 'cejas', label: 'Cejas' },
  { id: 'ojos', label: 'Ojos' },
  { id: 'nariz', label: 'Nariz' },
  { id: 'mejillas', label: 'Mejillas' },
  { id: 'labios', label: 'Labios' },
  { id: 'rostro', label: 'Rostro' },
]

export const FACE_REGION_IDS = FACE_REGIONS.map((r) => r.id) as [string, ...string[]]

export function getFaceRegionLabel(id: string | null): string | null {
  if (!id) return null
  return FACE_REGIONS.find((r) => r.id === id)?.label ?? null
}
