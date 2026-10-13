import { Header } from '@/components/ui/Header'
import { Footer } from '@/components/ui/Footer'
import { CartPortal } from '@/components/store/CartPortal'
import { CompareTray } from '@/components/store/CompareTray'
import { WhatsAppFAB } from '@/components/ui/WhatsAppFAB'
import { createAdminClient } from '@/lib/supabase/server'
import { toWhatsAppDigits } from '@/lib/format'

// Este layout envuelve toda la tienda: si leyera cookies (sesión), TODAS sus
// páginas quedarían dinámicas y /producto/[slug] perdería el ISR. Por eso no
// toca la sesión (el carrito la resuelve en el cliente) y lee la configuración
// sin cookies. Se usa el cliente admin porque RLS solo deja ver una de estas
// claves sin sesión; se piden únicamente las 4 que igual se muestran en la página.
async function getStoreConfig(): Promise<{
  instagram_url?: string
  whatsapp_number?: string
  delivery_fee?: string
  store_email?: string
}> {
  try {
    const supabase = await createAdminClient()
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
  const config = await getStoreConfig()

  const deliveryFee = parseInt(config.delivery_fee ?? '5000', 10)
  const waPhone = config.whatsapp_number
    ? toWhatsAppDigits(config.whatsapp_number)
    : '573155924590'

  return (
    <>
      <Header />
      <CartPortal deliveryFee={deliveryFee} />
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
