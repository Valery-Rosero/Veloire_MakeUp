import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PagoClient } from '@/components/store/PagoClient'

export const metadata: Metadata = {
  title: 'Pago',
  robots: { index: false },
}

async function getPageData(): Promise<{
  nequiNumber: string
  nequiName: string
  deliveryFee: number
}> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('store_config')
      .select('key, value')
      .in('key', ['nequi_number', 'nequi_name', 'delivery_fee'])
    const config = Object.fromEntries(
      ((data as Array<{ key: string; value: string }> | null) ?? []).map(({ key, value }) => [
        key,
        value,
      ])
    )
    return {
      nequiNumber: config.nequi_number ?? '3155924590',
      nequiName: config.nequi_name ?? '',
      deliveryFee: parseInt(config.delivery_fee ?? '5000', 10),
    }
  } catch {
    return { nequiNumber: '3155924590', nequiName: '', deliveryFee: 5000 }
  }
}

export default async function PagoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/checkout')

  const { nequiNumber, nequiName, deliveryFee } = await getPageData()
  return (
    <PagoClient
      nequiNumber={nequiNumber}
      nequiName={nequiName}
      deliveryFee={deliveryFee}
    />
  )
}
