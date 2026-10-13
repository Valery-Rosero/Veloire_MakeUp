import type { Metadata } from 'next'

// La página es de cliente y no puede exportar metadata.
export const metadata: Metadata = {
  title: 'Recuperar contraseña',
  robots: { index: false },
}

export default function RecuperarContrasenaLayout({ children }: { children: React.ReactNode }) {
  return children
}
