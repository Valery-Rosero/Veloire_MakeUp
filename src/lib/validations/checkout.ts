import { z } from 'zod'

// Schema for the checkout form (step 1) — user-entered fields only
export const checkoutFormSchema = z.object({
  customer_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  customer_email: z.string().email('Correo electrónico inválido'),
  customer_phone: z
    .string()
    .regex(/^\d{10}$/, 'El celular debe tener exactamente 10 dígitos'),
  address: z.string().min(5, 'La dirección es requerida'),
  neighborhood: z.string().min(2, 'El barrio es requerido'),
  notes: z.string().max(200, 'Máximo 200 caracteres').optional(),
})

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>

// Extended schema used to validate the full API body (includes derived fields)
export const checkoutSchema = checkoutFormSchema.extend({
  city: z.string().min(2),
  department: z.string().min(2),
  payment_method: z.enum(['nequi', 'bancolombia']),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
