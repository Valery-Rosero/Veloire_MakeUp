'use client'

import { useSyncExternalStore } from 'react'

function subscribe() {
  return () => {}
}

// Para contenido que solo puede renderizarse en el cliente (ej. librerías de
// gráficos que miden el DOM real) — false en el primer render (igual en
// servidor y cliente, sin parpadeo de hidratación), true desde el segundo.
// useSyncExternalStore es la única forma de dar una respuesta distinta en
// servidor vs. cliente sin disparar el lint de "setState dentro de un efecto".
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
