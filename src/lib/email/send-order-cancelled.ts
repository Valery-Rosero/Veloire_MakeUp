import { Resend } from 'resend'
import { OrderCancelled } from '@/lib/email/templates/OrderCancelled'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendOrderCancelledParams {
  orderNumber: string
  customerName: string
  customerEmail: string
}

// Best-effort — un fallo al enviar el correo nunca debe tumbar la cancelación real.
export async function sendOrderCancelledEmail({
  orderNumber,
  customerName,
  customerEmail,
}: SendOrderCancelledParams) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'Vèloire <noreply@veloire.co>',
    to: customerEmail,
    subject: `Pedido #${orderNumber} cancelado — Vèloire`,
    react: OrderCancelled({ orderNumber, customerName }),
  }).catch(() => undefined)
}
