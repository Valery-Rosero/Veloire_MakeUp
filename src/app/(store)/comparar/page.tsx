import type { Metadata } from 'next'
import { CompareTable } from '@/components/store/CompareTable'

export const metadata: Metadata = {
  title: 'Comparar productos — Vèloire',
  description: 'Compara productos de Vèloire lado a lado: ingredientes, tipo de piel, acabado y más.',
}

export default function CompararPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10 md:py-14">
      <h1 className="font-display text-2xl md:text-3xl text-fg mb-6">Comparar productos</h1>
      <CompareTable />
    </main>
  )
}
