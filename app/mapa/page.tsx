'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useMemo } from 'react'
import {
  Crosshair, Star, Church, Tree, ShoppingBag, Bank,
  List, X, Buildings, Palette, Crown, MapPin,
} from '@phosphor-icons/react'
import Link from 'next/link'
import type { Icon } from '@phosphor-icons/react'
import { LUGARES, DESTINOS, hrefFor } from '@/lib/data'

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

// ── Category → icon / color maps ──────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, Icon> = {
  Iglesia: Church,
  Basílica: Church,
  Monasterio: Church,
  Templo: Star,
  Santuario: Star,
  Experiencia: Star,
  Bosque: Tree,
  Parque: Tree,
  Jardín: Tree,
  Monumento: Bank,
  Fuente: Bank,
  Ruinas: Bank,
  Mercado: ShoppingBag,
  Palacio: Crown,
  Castillo: Crown,
  Rascacielos: Buildings,
  Museo: Palette,
}

const CATEGORY_COLORS: Record<string, string> = {
  Iglesia: '#FDE8D8',
  Basílica: '#FDE8D8',
  Monasterio: '#FDE8D8',
  Templo: '#FEF3C7',
  Santuario: '#FEF3C7',
  Experiencia: '#FEF3C7',
  Bosque: '#DCFCE7',
  Parque: '#DCFCE7',
  Jardín: '#DCFCE7',
  Monumento: '#DBEAFE',
  Fuente: '#DBEAFE',
  Ruinas: '#F3E8FF',
  Mercado: '#FFF7ED',
  Barrio: '#ECFDF5',
  Plaza: '#ECFDF5',
  Palacio: '#E0E7FF',
  Castillo: '#E0E7FF',
  Museo: '#FCE7F3',
  Rascacielos: '#E0F2FE',
}

function getCategoryIcon(category: string): Icon {
  return CATEGORY_ICONS[category] ?? MapPin
}

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#EDE9E4'
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MapDestino {
  id: string
  title: string
  image: string
  lat: number
  lng: number
}

// ── Destino coordinates (kept here to avoid touching Destino interface) ───────

const DESTINO_COORDS: Record<string, { lat: number; lng: number }> = {
  venecia:   { lat: 45.4408,  lng: 12.3155 },
  cusco:     { lat: -13.5319, lng: -71.9675 },
  patagonia: { lat: -50.9547, lng: -73.4162 },
  marruecos: { lat: 31.6295,  lng: -7.9811 },
  kyoto:     { lat: 35.0116,  lng: 135.7681 },
  bangkok:   { lat: 13.7563,  lng: 100.5018 },
  roma:      { lat: 41.9028,  lng: 12.4964 },
  amsterdam: { lat: 52.3676,  lng: 4.9041 },
  lisboa:    { lat: 38.7223,  lng: -9.1393 },
  singapur:  { lat: 1.3521,   lng: 103.8198 },
  madrid:    { lat: 40.4168,  lng: -3.7038 },
}

const ALL_MAP_DESTINOS: MapDestino[] = DESTINOS
  .filter(d => DESTINO_COORDS[d.id] !== undefined)
  .map(d => ({
    id: d.id,
    title: d.title,
    image: d.image,
    lat: DESTINO_COORDS[d.id].lat,
    lng: DESTINO_COORDS[d.id].lng,
  }))

// ── Haversine distance (km) ───────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Derived places from LUGARES with coordinates ─────────────────────────────

export interface MapPlace {
  id: string
  category: string
  title: string
  location: string
  rating: number
  lat: number
  lng: number
}

const ALL_PLACES: MapPlace[] = LUGARES
  .filter((l): l is typeof l & { lat: number; lng: number } =>
    l.lat !== undefined && l.lng !== undefined
  )
  .map(l => ({
    id: l.id,
    category: l.category,
    title: l.title,
    location: l.location,
    rating: l.rating,
    lat: l.lat!,
    lng: l.lng!,
  }))

const CATEGORIES = ['Todos', ...Array.from(new Set(ALL_PLACES.map(p => p.category))).sort()]

// ── Component ─────────────────────────────────────────────────────────────────

export default function MapaPage() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [nearbyMode, setNearbyMode] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  function toggleNearby() {
    if (nearbyMode) { setNearbyMode(false); return }
    if (userCoords) { setNearbyMode(true); return }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setNearbyMode(true)
        setGeoLoading(false)
      },
      () => setGeoLoading(false),
      { timeout: 8000 }
    )
  }

  // All places for the active category — passed to MapView for rendering markers
  const mapPlaces = useMemo(() =>
    activeCategory === 'Todos'
      ? ALL_PLACES
      : ALL_PLACES.filter(p => p.category === activeCategory)
  , [activeCategory])

  // List items — filtered by current viewport bounds and optionally sorted by proximity
  const filtered = useMemo(() => {
    let list = mapPlaces
    if (mapBounds) {
      list = list.filter(p =>
        p.lat >= mapBounds.south && p.lat <= mapBounds.north &&
        p.lng >= mapBounds.west && p.lng <= mapBounds.east
      )
    }
    if (nearbyMode && userCoords) {
      list = [...list].sort(
        (a, b) =>
          haversineKm(userCoords.lat, userCoords.lng, a.lat, a.lng) -
          haversineKm(userCoords.lat, userCoords.lng, b.lat, b.lng)
      )
    }
    return list
  }, [mapPlaces, mapBounds, nearbyMode, userCoords])

  function handleSelect(id: string) {
    setSelectedId(prev => (prev === id ? null : id))
    if (isMobile) setPanelOpen(false)
  }

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
          {filtered.length} lugar{filtered.length !== 1 ? 'es' : ''} en vista
        </p>

        <div className="flex gap-2 overflow-x-auto scroll-hide pb-1">
          <button
            onClick={toggleNearby}
            aria-pressed={nearbyMode}
            disabled={geoLoading}
            className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200"
            style={{
              background: nearbyMode ? 'var(--color-crimson)' : 'var(--color-surface)',
              color: nearbyMode ? 'white' : 'var(--color-crimson)',
              border: nearbyMode ? 'none' : '1px solid var(--color-crimson)',
              opacity: geoLoading ? 0.6 : 1,
            }}
          >
            <Crosshair size={12} aria-hidden="true" />
            {geoLoading ? 'Localizando…' : 'Cerca de mí'}
          </button>
          {CATEGORIES.map(cat => {
            const isActive = cat === activeCategory
            const CatIcon = cat !== 'Todos' ? getCategoryIcon(cat) : null
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
          const PlaceIcon = getCategoryIcon(place.category)
          const bgColor = getCategoryColor(place.category)
          const isSelected = selectedId === place.id

          return (
            <button
              key={place.id}
              onClick={() => handleSelect(place.id)}
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
                      <span className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                        · {place.location}
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
                    {place.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="mt-3">
                  <Link
                    href={`/explorar/${place.id}`}
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
        <MapView
          places={mapPlaces}
          destinos={ALL_MAP_DESTINOS}
          selectedId={selectedId}
          onSelect={handleSelect}
          onBoundsChange={setMapBounds}
        />

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
