'use client'

import { useCallback, useSyncExternalStore } from 'react'

export function useIsMobile(breakpoint = 768) {
  const query = `(max-width: ${breakpoint - 1}px)`

  const subscribe = useCallback(
    (callback: () => void) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', callback)
      return () => mq.removeEventListener('change', callback)
    },
    [query]
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
