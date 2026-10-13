'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { createClient } from '@/lib/supabase/client'
import { CartDrawer } from './CartDrawer'

interface CartPortalProps {
  deliveryFee: number
}

export function CartPortal({ deliveryFee }: CartPortalProps) {
  const drawerOpen = useCartStore((s) => s.drawerOpen)
  const closeDrawer = useCartStore((s) => s.closeDrawer)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // La sesión se resuelve en el navegador para que el layout de la tienda no
  // lea cookies (ver (store)/layout.tsx). Solo decide el texto del botón del
  // carrito; /checkout igual exige sesión del lado del servidor.
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <CartDrawer
      open={drawerOpen}
      onClose={closeDrawer}
      deliveryFee={deliveryFee}
      isLoggedIn={isLoggedIn}
    />
  )
}
