'use client'

import { MotionConfig } from 'framer-motion'

// reducedMotion="user": si la persona activó "reducir movimiento" en su
// sistema, framer-motion salta los desplazamientos/escalas (deja solo los
// fundidos) en TODAS las animaciones de la app, sin revisarlo componente por
// componente. Los efectos atados al scroll (parallax) no pasan por acá: esos
// revisan useReducedMotion() a mano.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
