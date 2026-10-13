import { RevealGroup, RevealItem } from '@/components/ui/Reveal'

interface Props {
  title: string
  subtitle?: string
  className?: string
}

// Título de sección con la barrita rosa a la izquierda — la firma visual de la
// tienda. Al entrar en pantalla la barrita crece de abajo hacia arriba y el
// título se desliza a su lado.
export function SectionHeading({ title, subtitle, className = '' }: Props) {
  return (
    <RevealGroup stagger={0.12} className={`flex items-start gap-4 ${className}`}>
      <RevealItem variant="growY" className="w-0.75 h-10 mt-1 shrink-0 bg-accent origin-bottom" />
      <RevealItem variant="slideX">
        <h2 className="font-display text-2xl md:text-[28px] text-fg leading-tight">{title}</h2>
        {subtitle && (
          <p className="font-body text-sm text-accent mt-1" style={{ fontStyle: 'italic' }}>
            {subtitle}
          </p>
        )}
      </RevealItem>
    </RevealGroup>
  )
}
