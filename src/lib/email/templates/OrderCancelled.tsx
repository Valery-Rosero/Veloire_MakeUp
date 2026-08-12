import * as React from 'react'

interface Props {
  orderNumber: string
  customerName: string
}

export function OrderCancelled({ orderNumber, customerName }: Props) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1 style={{ color: '#D4537E' }}>Vèloire</h1>
      <h2>Hola {customerName}, tu pedido fue cancelado.</h2>
      <p>
        El pedido <strong>#{orderNumber}</strong> ha sido cancelado.
      </p>
      <p style={{ color: '#666', fontSize: 14 }}>
        Si tienes dudas o crees que esto fue un error, escríbenos a{' '}
        <a href="mailto:veloirev.f@gmail.com" style={{ color: '#D4537E' }}>
          veloirev.f@gmail.com
        </a>{' '}
        o por WhatsApp y te ayudamos de inmediato.
      </p>
      <p style={{ color: '#999', fontSize: 13, marginTop: 24 }}>
        — Lery · Vèloire MakeUp
      </p>
    </div>
  )
}
