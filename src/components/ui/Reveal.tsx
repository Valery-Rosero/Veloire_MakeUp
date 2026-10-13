'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'

// Piezas para "aparecer al hacer scroll" con el mismo ritmo en toda la tienda.
//
//   <Reveal variant="up">…</Reveal>                 → un bloque suelto
//   <RevealGroup stagger={0.1}>                     → un grupo escalonado:
//     <RevealItem variant="pop">…</RevealItem>        cada hijo entra después
//   </RevealGroup>                                     del anterior
//
// Se pueden usar desde Server Components (los hijos siguen siendo del servidor).
// Solo animan opacity/transform (y clip-path en "curtain"), que la GPU mueve
// sin recalcular el layout. La preferencia "reducir movimiento" la resuelve
// MotionProvider; acá solo se cambia "curtain" por un fundido.

const EASE = [0.22, 1, 0.36, 1] as const

// La animación arranca cuando el elemento ya entró un poco en pantalla, no
// apenas asoma el borde — si no, en pantallas altas se termina sin que se vea.
const VIEWPORT = { once: true, margin: '0px 0px -12% 0px' } as const

// `custom` = retraso extra en segundos. Solo se pone `delay` si viene: un
// delay explícito pisaría el escalonado que reparte RevealGroup.
const withDelay = (d: number | undefined) => (d ? { delay: d } : {})

export const revealVariants = {
  up: {
    hidden: { opacity: 0, y: 24 },
    visible: (d?: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, ...withDelay(d) } }),
  },
  fade: {
    hidden: { opacity: 0 },
    visible: (d?: number) => ({ opacity: 1, transition: { duration: 0.6, ease: 'easeOut', ...withDelay(d) } }),
  },
  slideX: {
    hidden: { opacity: 0, x: -14 },
    visible: (d?: number) => ({ opacity: 1, x: 0, transition: { duration: 0.55, ease: EASE, ...withDelay(d) } }),
  },
  pop: {
    hidden: { opacity: 0, scale: 0.5 },
    visible: (d?: number) => ({
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 420, damping: 18, ...withDelay(d) },
    }),
  },
  // Barrita / línea que crece. El punto de origen va en className
  // (origin-bottom, origin-top, origin-left…).
  growY: {
    hidden: { scaleY: 0 },
    visible: (d?: number) => ({ scaleY: 1, transition: { duration: 0.6, ease: EASE, ...withDelay(d) } }),
  },
  growX: {
    hidden: { scaleX: 0 },
    visible: (d?: number) => ({ scaleX: 1, transition: { duration: 0.6, ease: EASE, ...withDelay(d) } }),
  },
  // Se descubre de abajo hacia arriba, como una cortina que sube.
  curtain: {
    hidden: { clipPath: 'inset(100% 0% 0% 0%)' },
    visible: (d?: number) => ({
      clipPath: 'inset(0% 0% 0% 0%)',
      transition: { duration: 0.9, ease: EASE, ...withDelay(d) },
    }),
  },
} satisfies Record<string, Variants>

export type RevealVariant = keyof typeof revealVariants

const TAGS = {
  div: motion.div,
  span: motion.span,
  li: motion.li,
  ul: motion.ul,
  p: motion.p,
}
type Tag = keyof typeof TAGS

function useVariant(variant: RevealVariant): Variants {
  const reduced = useReducedMotion()
  return revealVariants[reduced && variant === 'curtain' ? 'fade' : variant]
}

interface RevealProps {
  variant?: RevealVariant
  /** Retraso en segundos antes de arrancar. */
  delay?: number
  as?: Tag
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

/** Un bloque que aparece solo cuando entra en pantalla. */
export function Reveal({ variant = 'up', delay, as = 'div', className, style, children }: RevealProps) {
  const Component = TAGS[as] as typeof motion.div
  return (
    <Component
      variants={useVariant(variant)}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      className={className}
      style={style}
    >
      {children}
    </Component>
  )
}

interface RevealGroupProps {
  /** Segundos entre un hijo y el siguiente. */
  stagger?: number
  /** Segundos antes de que arranque el primer hijo. */
  delayChildren?: number
  as?: Tag
  className?: string
  children?: React.ReactNode
}

/** Contenedor que hace entrar a sus <RevealItem> uno tras otro. */
export function RevealGroup({ stagger = 0.08, delayChildren = 0, as = 'div', className, children }: RevealGroupProps) {
  const Component = TAGS[as] as typeof motion.div
  return (
    <Component
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger, delayChildren } } }}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      className={className}
    >
      {children}
    </Component>
  )
}

type RevealItemProps = Omit<RevealProps, 'delay'>

/** Hijo de <RevealGroup>: hereda el momento de entrada del grupo. */
export function RevealItem({ variant = 'up', as = 'div', className, style, children }: RevealItemProps) {
  const Component = TAGS[as] as typeof motion.div
  return (
    <Component variants={useVariant(variant)} className={className} style={style}>
      {children}
    </Component>
  )
}

interface MaskLineProps {
  children: React.ReactNode
  /** Retraso en segundos (para escalonar varias líneas). */
  delay?: number
  className?: string
}

/**
 * Línea de título que sube desde abajo de su propio recorte, como si saliera
 * de detrás de una cortina. Anima al montar: pensada para títulos que ya se
 * ven al cargar la página. El padding compensa las letras que bajan de la
 * línea (y, q, j) y las cursivas, que el overflow-hidden cortaría.
 */
export function MaskLine({ children, delay = 0, className = '' }: MaskLineProps) {
  return (
    <span className={`block overflow-hidden pb-[0.12em] -mb-[0.12em] pr-[0.12em] -mr-[0.12em] ${className}`}>
      <motion.span
        className="block"
        initial={{ y: '110%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  )
}
