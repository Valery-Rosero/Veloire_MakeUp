// Estructura común de /privacidad y /terminos — mismo encabezado que /envios.

export const LEGAL_CONTACT = {
  owner: 'Valery Rosero',
  email: 'veloirev.f@gmail.com',
  city: 'Pasto, Nariño, Colombia',
  updated: '12 de octubre de 2026',
}

export function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string
  title: string
  intro: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <main>
      <section className="bg-alt border-b border-rim py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="font-body uppercase text-accent mb-4" style={{ fontSize: '10px', letterSpacing: '4px' }}>
            {eyebrow}
          </p>
          <h1 className="font-display text-[40px] md:text-[56px] text-fg leading-[1.06] tracking-tight mb-5">
            {title}
          </h1>
          <p className="font-body text-base text-fg-2 leading-[1.7] max-w-xl mx-auto">{intro}</p>
          <p className="font-body text-xs text-fg-3 mt-5">Última actualización: {LEGAL_CONTACT.updated}</p>
        </div>
      </section>

      <section className="py-14 md:py-16 bg-page">
        <div className="max-w-3xl mx-auto px-4 space-y-10">{children}</div>
      </section>
    </main>
  )
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-px h-7 bg-accent shrink-0" />
        <h2 className="font-display text-xl md:text-2xl text-fg">{title}</h2>
      </div>
      <div className="space-y-3 font-body text-sm text-fg-2 leading-[1.85] [&_strong]:text-fg [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-accent [&_a]:underline-offset-4 hover:[&_a]:underline">
        {children}
      </div>
    </section>
  )
}
