'use client'

import { useEffect } from 'react'

/**
 * Registra el service worker solo en producción.
 * En desarrollo, el SW interferiría con HMR y cachearía chunks volátiles.
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // El registro falló (modo privado, storage lleno): la app funciona igual sin offline
    })
  }, [])

  return null
}
