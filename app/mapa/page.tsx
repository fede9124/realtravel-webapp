'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Crosshair, Sliders, Star, Church, Tree, ForkKnife, ShoppingBag, Bank } from '@phosphor-icons/react'
import Link from 'next/link'
import type { Icon } from '@phosphor-icons/react'
import { findAny, hrefFor } from '@/lib/data'

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-3"
      style={{ background: 'var(--color-map-placeholder)' }}
    >
      <div
        className="w-10 h-10 rounded-full border-4 animate-spin"
        style={{ borderColor: 'var(--color-crimson)', borderTopColor: 'transparent' }}
        role="status"
        aria-label="Cargando mapa"
      />
      <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
        Cargando mapa...
      </span>
    </div>
  ),
})

type Category = 'Iglesia' | 'Plaza' | 'Restaurante' | 'Tienda' | 'Monumento'

const CATEGORY_ICONS: Record<Category, Icon> = {
  Iglesia: Church,
  Plaza: Tree,
  Restaurante: ForkKnife,
  Tienda: ShoppingBag,
  Monumento: Bank,
}

const CATEGORY_COLORS: Record<Category, string> = {
  Iglesia: '#FDE8D8',
  Plaza: '#DCFCE7',
  Restaurante: '#FEF3C7',
  Tienda: '#EDE9FE',
  Monumento: '#DBEAFE',
}

const PLACES: { id: string; category: Category; title: string; location: string; distance: string; rating: number }[] = [
  { id: 'santa-gemma', category: 'Iglesia', title: 'Parroquia de Santa Gemma', location: 'España', distance: '0.34 km', rating: 4.8 },
  { id: 'plaza-mayor', category: 'Plaza', title: 'Plaza Mayor de Madrid', location: 'España', distance: '1.2 km', rating: 4.6 },
  { id: 'rincon', category: 'Restaurante', title: 'Restaurante El Rincón', location: 'Madrid', distance: '0.5 km', rating: 4.5 },
  { id: 'boutique', category: 'Tienda', title: 'Boutique Local Moda', location: 'Barcelona', distance: '0.8 km', rating: 4.3 },
  { id: 'arco', category: 'Monumento', title: 'Arco del Triunfo', location: 'España', distance: '1.5 km', rating: 4.7 },
]

const CATEGORY_FILTERS = ['Todos', 'Iglesia', 'Plaza', 'Restaurante', 'Tienda', 'Monumento']

export default function MapaPage() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = activeCategory === 'Todos'
    ? PLACES
    : PLACES.filter(p => p.category === activeCategory)

  return (
    <div className="flex h-[100dvh] overflow-hidden" style={{ background: 'var(--color-surface)' }}>

      {/* Left panel */}
      <div
        className="flex flex-col border-r overflow-hidden flex-shrink-0"
        style={{ width: '380px', background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="px-6 pt-7 pb-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h1
            className="text-xl font-bold mb-1"
            style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--color-text-primary)' }}
          >
            Mapa
          </h1>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            {filtered.length} lugares encontrados
          </p>

          <div className="flex gap-2 overflow-x-auto scroll-hide pb-1">
            {CATEGORY_FILTERS.map(cat => {
              const isActive = cat === activeCategory
              const CatIcon = cat !== 'Todos' ? CATEGORY_ICONS[cat as Category] : null
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={isActive}
                  className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200"
                  style={{
                    background: isActive ? 'var(--color-crimson)' : 'var(--color-surface)',
                    color: isActive ? 'white' : 'var(--color-text-muted)',
                    border: isActive ? 'none' : '1px solid var(--color-border)',
                  }}
                >
                  {CatIcon && <CatIcon size={12} aria-hidden="true" />}
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map(place => {
            const PlaceIcon = CATEGORY_ICONS[place.category]
            const bgColor = CATEGORY_COLORS[place.category]
            const isSelected = selectedId === place.id

            return (
              <button
                key={place.id}
                onClick={() => setSelectedId(isSelected ? null : place.id)}
                className="w-full text-left px-6 py-[18px] border-b cursor-pointer transition-colors"
                style={{
                  borderColor: 'var(--color-border)',
                  background: isSelected ? 'var(--color-crimson-light)' : 'transparent',
                }}
                onMouseEnter={e => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--color-surface)'
                }}
                onMouseLeave={e => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent'
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: bgColor }}
                      aria-hidden="true"
                    >
                      <PlaceIcon size={17} weight="regular" style={{ color: 'var(--color-text-primary)' }} />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="font-semibold text-sm truncate"
                        style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-heading)' }}
                      >
                        {place.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{ color: 'var(--color-crimson)', background: 'var(--color-crimson-light)' }}
                        >
                          {place.category}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          · {place.distance}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <Star size={11} weight="fill" color="#FBBF24" aria-hidden="true" />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-heading)' }}
                    >
                      {place.rating}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-3">
                    <Link
                      href={(() => { const item = findAny(place.id); return item ? hrefFor(item) : '/explorar' })()}
                      className="block text-center text-xs font-semibold py-2 rounded-lg text-white cursor-pointer transition-opacity hover:opacity-90"
                      style={{ background: 'var(--color-crimson)' }}
                      onClick={e => e.stopPropagation()}
                    >
                      Ver detalle
                    </Link>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapView />
        <div
          className="absolute right-5 bottom-8 flex flex-col gap-3"
          role="group"
          aria-label="Controles del mapa"
        >
          <button
            className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
            aria-label="Centrar en mi ubicación"
          >
            <Crosshair size={18} weight="regular" style={{ color: 'var(--color-crimson)' }} aria-hidden="true" />
          </button>
          <button
            className="w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
            aria-label="Filtrar categorías"
          >
            <Sliders size={18} weight="regular" style={{ color: 'var(--color-text-primary)' }} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
