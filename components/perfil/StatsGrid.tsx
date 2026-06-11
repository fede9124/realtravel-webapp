'use client'

import { useFavorites } from '@/hooks/useFavorites'

const STATIC_STATS = [
  { value: '5', label: 'Destinos visitados' },
  { value: '8', label: 'Reseñas publicadas' },
  { value: '3', label: 'Rutas creadas' },
]

/** Grid de estadísticas del perfil. El conteo de guardados lee el estado real de favoritos. */
export function StatsGrid() {
  const { favorites } = useFavorites()

  const stats = [
    { value: String(favorites.size), label: favorites.size === 1 ? 'Lugar guardado' : 'Lugares guardados' },
    ...STATIC_STATS,
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map(({ value, label }) => (
        <div
          key={label}
          className="rounded-2xl p-5 flex flex-col"
          style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
        >
          <span
            className="text-2xl font-bold"
            style={{ color: 'var(--color-crimson)', fontVariantNumeric: 'tabular-nums' }}
          >
            {value}
          </span>
          <span className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--color-text-muted)' }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
