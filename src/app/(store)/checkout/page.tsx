import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CheckoutClient } from '@/components/store/CheckoutClient'
import type { CheckoutFormData } from '@/lib/validations/checkout'

export const metadata: Metadata = {
  title: 'Finalizar compra',
  robots: { index: false },
}

export default async function CheckoutPage() {
  const supabase = await createClient()

  // Auth check outside try/catch — redirect() throws a special error that
  // must not be swallowed by a catch block
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/checkout')

  let deliveryFee = 5000
  let prefilledData: Partial<CheckoutFormData> | null = null

  try {
    const [configResult, profileResult] = await Promise.all([
      supabase
        .from('store_config')
        .select('value')
        .eq('key', 'delivery_fee')
        .limit(1),
      supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('id', user.id)
        .limit(1),
    ])

    deliveryFee = parseInt(
      (configResult.data as Array<{ value: string }> | null)?.[0]?.value ?? '5000',
      10
    )

    const profile = (
      profileResult.data as Array<{
        full_name: string | null
        email: string
        phone: string | null
      }> | null
    )?.[0]

    if (profile) {
      prefilledData = {
        customer_name: profile.full_name ?? '',
        customer_email: profile.email,
        customer_phone: profile.phone ?? '',
      }
    }
  } catch {
    // Use defaults if data fetching fails
  }

  return (
    <CheckoutClient
      deliveryFee={deliveryFee}
      prefilledData={prefilledData}
      hasSession={true}
    />
  )
}
