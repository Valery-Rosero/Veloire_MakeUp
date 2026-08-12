import Link from 'next/link'

interface FooterProps {
  instagramUrl?: string
  whatsappNumber?: string
  email?: string
}

const NAV_LINKS = [
  { label: 'Catálogo', href: '/catalogo' },
  { label: 'Sobre nosotras', href: '/nosotras' },
  { label: 'Contacto', href: '/contacto' },
  { label: 'Política de envíos', href: '/envios' },
]

const DEFAULT_INSTAGRAM_URL = 'https://www.instagram.com/veloire.v?igsh=eTRjY3N5N3U1NDhi'
const DEFAULT_EMAIL = 'veloirev.f@gmail.com'

export function Footer({ instagramUrl, whatsappNumber, email }: FooterProps) {
  const waHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`
    : null
  const igHref = instagramUrl || DEFAULT_INSTAGRAM_URL
  const contactEmail = email || DEFAULT_EMAIL

  return (
    <footer className="bg-alt border-t border-rim mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="font-display text-xl text-accent uppercase tracking-widest">
              Vèloire
            </Link>
            <p className="text-sm text-fg-2 text-center md:text-left leading-relaxed">
              El maquillaje que te hace sentir tú.
            </p>
          </div>

          {/* Navegación */}
          <nav className="flex flex-col items-center md:items-start gap-3">
            <p className="text-xs font-body font-medium uppercase tracking-widest text-fg-3 mb-1">
              Explorar
            </p>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-fg-2 hover:text-accent transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Contacto y redes */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <p className="text-xs font-body font-medium uppercase tracking-widest text-fg-3 mb-1">
              Contacto
            </p>

            {/* Instagram */}
            <a
              href={igHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-fg-2 hover:text-accent transition-colors duration-150"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4.5" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
              </svg>
              @veloire.v
            </a>

            {/* Email */}
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center gap-2 text-sm text-fg-2 hover:text-accent transition-colors duration-150"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <polyline points="2,4 12,13 22,4" />
              </svg>
              {contactEmail}
            </a>

            {/* WhatsApp */}
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-fg-2 hover:text-accent transition-colors duration-150"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </a>
            )}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-rim text-center">
          <p className="text-xs text-fg-3">
            © {new Date().getFullYear()} Vèloire. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
