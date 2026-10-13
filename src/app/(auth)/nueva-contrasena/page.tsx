import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { NuevaContrasenaForm } from './NuevaContrasenaForm'

export const metadata: Metadata = {
  title: 'Nueva contraseña',
  robots: { index: false },
}

export default function NuevaContrasenaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-accent" />
        </div>
      }
    >
      <NuevaContrasenaForm />
    </Suspense>
  )
}
