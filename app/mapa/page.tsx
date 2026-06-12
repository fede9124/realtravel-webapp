'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { Crosshair, Sliders, Star, Church, Tree, ForkKnife, ShoppingBag, Bank, List, X } from '@phosphor-icons/react'
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

type Category = 'Iglesia' | 'Plaza' | 'Restaurante' | 'Tienda' | 'Monumento' | 'Basílica' | 'Palacio'

const CATEGORY_ICONS: Record<Category, Icon> = {
  Iglesia: Church,
  Plaza: Tree,
  Restaurante: ForkKnife,
  Tienda: ShoppingBag,
  Monumento: Bank,
  Basílica: Church,
  Palacio: Bank,
}

const CATEGORY_COLORS: Record<Category, string> = {
  Iglesia: '#FDE8D8',
  Plaza: '#DCFCE7',
  Restaurante: '#FEF3C7',
  Tienda: '#EDE9FE',
  Monumento: '#DBEAFE',
  Basílica: '#FDE8D8',
  Palacio: '#E0E7FF',
}

export interface MapPlace {
  id: string; category: Category; title: string; location: string; distance: string; rating: number
  lat: number; lng: number; emoji: string; color: string
}

const PLACES: MapPlace[] = [
  { id: 'santa-gemma', category: 'Iglesia', title: 'Parroquia de Santa Gemma', location: 'España', distance: '0.34 km', rating: 4.8, lat: 40.4168, lng: -3.7038, emoji: '⛪', color: '#E8D5C4' },
  { id: 'plaza-mayor', category: 'Plaza', title: 'Plaza Mayor de Madrid', location: 'España', distance: '1.2 km', rating: 4.6, lat: 40.4153, lng: -3.7022, emoji: '🏛️', color: '#C8E6C9' },
  { id: 'rincon', category: 'Restaurante', title: 'Restaurante El Rincón', location: 'Madrid', distance: '0.5 km', rating: 4.5, lat: 40.4142, lng: -3.7065, emoji: '🍽️', color: '#FFCCBC' },
  { id: 'boutique', category: 'Tienda', title: 'Boutique Local Moda', location: 'Barcelona', distance: '0.8 km', rating: 4.3, lat: 40.4178, lng: -3.7010, emoji: '🛍️', color: '#E1BEE7' },
  { id: 'arco', category: 'Monumento', title: 'Arco del Triunfo', location: 'España', distance: '1.5 km', rating: 4.7, lat: 40.4190, lng: -3.7055, emoji: '🗿', color: '#B3E5FC' },
  { id: 'sagrada-familia', category: 'Monumento', title: 'Sagrada Família', location: 'España', distance: '2.1 km', rating: 4.9, lat: 40.4130, lng: -3.7080, emoji: '🗿', color: '#B3E5FC' },
  { id: 'alhambra', category: 'Palacio', title: 'La Alhambra de Granada', location: 'España', distance: '4.5 km', rating: 4.9, lat: 40.4200, lng: -3.7000, emoji: '🏰', color: '#E0E7FF' },
  { id: 'tapas', category: 'Restaurante', title: 'Bar de Tapas Tradicional', location: 'Sevilla', distance: '0.3 km', rating: 4.4, lat: 40.4160, lng: -3.7050, emoji: '🍽️', color: '#FFCCBC' },
  { id: 'ceramica', category: 'Tienda', title: 'Taller Cerámica Artesanal', location: 'Toledo', distance: '1.1 km', rating: 4.7, lat: 40.4175, lng: -3.7070, emoji: '🛍️', color: '#E1BEE7' },
  { id: 'artesania-local', category: 'Tienda', title: 'Mercado de Artesanías', location: 'Valencia', distance: '2.0 km', rating: 4.5, lat: 40.4145, lng: -3.7015, emoji: '🛍️', color: '#E1BEE7' },
]

const CATEGORY_FILTERS = ['Todos', 'Iglesia', 'Plaza', 'Restaurante', 'Tienda', 'Monumento', 'Palacio']

export default function MapaPage() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const filtered = activeCategory === 'Todos'
    ? PLACES
    : PLACES.filter(p => p.category === activeCategory)

  const panelContent = (
    <>
      <div className="px-5 pt-5 pb-4 border-b flex-shrink-0" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between mb-1">
          <h1
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--color-text-primary)' }}
          >
            Mapa
          </h1>
          {isMobile && (
            <button
              onClick={() => setPanelOpen(false)}
              aria-label="Cerrar lista"
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X size={18} weight="regular" aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
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
              className="w-full text-left px-5 py-[16px] border-b cursor-pointer transition-colors"
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
    </>
  )

  return (
    <div className="flex h-[100dvh] overflow-hidden" style={{ background: 'var(--color-surface)' }}>

      {/* Desktop: side panel */}
      {!isMobile && (
        <div
          className="flex flex-col border-r overflow-hidden flex-shrink-0"
          style={{ width: '360px', background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
        >
          {panelContent}
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <MapView places={PLACES} selectedId={selectedId} />

        {/* Mobile: toggle list button */}
        {isMobile && (
          <button
            onClick={() => setPanelOpen(true)}
            className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{
              background: 'var(--color-card)',
              boxShadow: 'var(--shadow-card-hover)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-heading)',
              zIndex: 10,
            }}
          >
            <List size={16} weight="regular" aria-hidden="true" />
            {filtered.length} lugares
          </button>
        )}

        <div
          className="absolute right-5 bottom-8 flex flex-col gap-3"
          role="group"
          aria-label="Controles del mapa"
          style={{ zIndex: 10 }}
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

      {/* Mobile: bottom sheet panel */}
      {isMobile && (
        <>
          {panelOpen && (
            <div
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.4)' }}
              onClick={() => setPanelOpen(false)}
              aria-hidden="true"
            />
          )}
          <div
            className="fixed left-0 right-0 bottom-0 z-50 flex flex-col rounded-t-2xl overflow-hidden"
            style={{
              maxHeight: '75vh',
              background: 'var(--color-card)',
              boxShadow: '0 -4px 24px rgba(45,20,8,0.12)',
              transform: panelOpen ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            <div
              className="w-10 h-1 rounded-full mx-auto mt-2.5 mb-1 flex-shrink-0"
              style={{ background: 'var(--color-border)' }}
              aria-hidden="true"
            />
            {panelContent}
          </div>
        </>
      )}
    </div>
  )
}
