'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'rt-favorites'

/** Favoritos persistentes en localStorage, compartidos entre páginas. */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Lectura diferida al cliente para evitar mismatch de hidratación
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setFavorites(new Set(JSON.parse(raw) as string[]))
    } catch {
      // localStorage no disponible (Safari privado, etc.) — favoritos quedan en memoria
    }
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      } catch {
        // escritura falló: se mantiene el estado en memoria
      }
      return next
    })
  }, [])

  return { favorites, toggleFavorite }
}
