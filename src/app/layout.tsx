import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { CookieConsent } from '@/components/ui/CookieConsent'
import { MotionProvider } from '@/components/ui/MotionProvider'
import { SITE_URL } from '@/lib/site'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
})

const DESCRIPTION =
  'Tienda de maquillaje online desde Pasto, Nariño. Encuentra tu tono perfecto entre nuestra colección.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Vèloire — Maquillaje',
    template: '%s — Vèloire',
  },
  description: DESCRIPTION,
  openGraph: {
    siteName: 'Vèloire',
    locale: 'es_CO',
    type: 'website',
    title: 'Vèloire — Maquillaje',
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      {/* Script anti-FOUC: se ejecuta antes de hidratación de React porque
          está en el <head> del server component, renderizado como HTML plano */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <MotionProvider>
            {children}
            <CookieConsent />
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
