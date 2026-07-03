import { z } from 'zod'
import { FACE_REGION_IDS } from '@/lib/face-regions'

export const categorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  description: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  face_region: z.enum(FACE_REGION_IDS).optional().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
})

export type CategoryInput = z.infer<typeof categorySchema>
