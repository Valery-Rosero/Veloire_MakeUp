import type { Metadata } from 'next'

// La página del carrito es de cliente y no puede exportar metadata.
export const metadata: Metadata = {
  title: 'Carrito',
  robots: { index: false },
}

export default function CarritoLayout({ children }: { children: React.ReactNode }) {
  return children
}
