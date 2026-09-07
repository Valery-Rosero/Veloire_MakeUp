import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { CartPortal } from '@/components/store/CartPortal'
import { CompareTray } from '@/components/store/CompareTray'
import { WhatsAppFAB } from '@/components/ui/WhatsAppFAB'
import { createClient } from '@/lib/supabase/server'

async function getStoreConfig(): Promise<{
  instagram_url?: string
  whatsapp_number?: string
  delivery_fee?: string
  store_email?: string
}> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('store_config')
      .select('key, value')
      .in('key', ['instagram_url', 'whatsapp_number', 'delivery_fee', 'store_email'])
    return Object.fromEntries((data ?? []).map(({ key, value }) => [key, value]))
  } catch {
    return {}
  }
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const [config, { data: { user } }] = await Promise.all([
    getStoreConfig(),
    supabase.auth.getUser(),
  ])

  const deliveryFee = parseInt(config.delivery_fee ?? '5000', 10)
  const waPhone = config.whatsapp_number
    ? config.whatsapp_number.replace(/\D/g, '')
    : '573155924590'

  return (
    <>
      <Header />
      <CartPortal deliveryFee={deliveryFee} isLoggedIn={!!user} />
      <main className="flex-1">{children}</main>
      <Footer
        instagramUrl={config.instagram_url}
        whatsappNumber={config.whatsapp_number}
        email={config.store_email}
      />
      <WhatsAppFAB
        phone={waPhone}
        message="Hola, quiero hacer un pedido de Vèloire 💄"
      />
      <CompareTray />
    </>
  )
}
