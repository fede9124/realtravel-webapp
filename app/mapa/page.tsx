'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  Crosshair, Star, MapPin, MagnifyingGlass,
  List, X, FunnelSimple,
} from '@phosphor-icons/react'
import Link from 'next/link'
import { LUGARES, DESTINOS, COMERCIOS, CATEGORIAS } from '@/lib/data'

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

// ── Comercios — coordenadas derivadas del destino vinculado + jitter determinístico ─

export interface MapComercio {
  id: string
  title: string
  category: string
  image: string
  lat: number
  lng: number
}

function hashJitter(id: string): { dLat: number; dLng: number } {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 10000
  const angle = (hash / 10000) * Math.PI * 2
  const radius = 0.04 + (hash % 7) * 0.01
  return { dLat: Math.sin(angle) * radius, dLng: Math.cos(angle) * radius }
}

const ALL_MAP_COMERCIOS: MapComercio[] = COMERCIOS
  .filter(c => c.destinoId && DESTINO_COORDS[c.destinoId] !== undefined)
  .map(c => {
    const base = DESTINO_COORDS[c.destinoId!]
    const { dLat, dLng } = hashJitter(c.id)
    return {
      id: c.id,
      title: c.title,
      category: c.category,
      image: c.logo ?? c.image,
      lat: base.lat + dLat,
      lng: base.lng + dLng,
    }
  })

type ListItem = {
  kind: 'lugar' | 'comercio'
  id: string
  title: string
  category: string
  image?: string
  lat: number
  lng: number
  location: string
  rating: number
  featured?: boolean
  description?: string
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

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
  categoria?: string
  title: string
  location: string
  rating: number
  lat: number
  lng: number
  featured?: boolean
  image?: string
  description?: string
}

const ALL_PLACES: MapPlace[] = LUGARES
  .filter((l): l is typeof l & { lat: number; lng: number } =>
    l.lat !== undefined && l.lng !== undefined
  )
  .map(l => ({
    id: l.id,
    category: l.category,
    categoria: l.categoria,
    title: l.title,
    location: l.location,
    rating: l.rating,
    lat: l.lat!,
    lng: l.lng!,
    featured: l.featured,
    image: l.image,
    description: l.description,
  }))

// ── Component ─────────────────────────────────────────────────────────────────

export default function MapaPage() {
  const [activeCategoria, setActiveCategoria] = useState<string | null>(null)
  const [categoriaOpen, setCategoriaOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [nearbyMode, setNearbyMode] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [flyToTarget, setFlyToTarget] = useState<{ lat: number; lng: number; zoom?: number } | null>(null)
  const [geoQuery, setGeoQuery] = useState('')
  const [geoResults, setGeoResults] = useState<{ place_name: string; center: [number, number] }[]>([])
  const geoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const handleGeoSearch = useCallback((q: string) => {
    setGeoQuery(q)
    if (geoTimerRef.current) clearTimeout(geoTimerRef.current)
    if (q.trim().length < 3) { setGeoResults([]); return }
    geoTimerRef.current = setTimeout(async () => {
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q.trim())}.json?access_token=${token}&limit=5&language=es`
        )
        const data = await res.json()
        setGeoResults(
          (data.features ?? []).map((f: { place_name: string; center: [number, number] }) => ({
            place_name: f.place_name,
            center: f.center,
          }))
        )
      } catch { setGeoResults([]) }
    }, 350)
  }, [])

  function handleGeoSelect(result: { place_name: string; center: [number, number] }) {
    setFlyToTarget({ lat: result.center[1], lng: result.center[0], zoom: 14 })
    setGeoQuery(result.place_name.split(',')[0])
    setGeoResults([])
  }

  // All places for the active categoría — passed to MapView for rendering markers
  const mapPlaces = useMemo(() =>
    activeCategoria === null
      ? ALL_PLACES
      : ALL_PLACES.filter(p => p.categoria === activeCategoria)
  , [activeCategoria])

  // Search results — across all places and comercios regardless of filters
  const searchResults = useMemo(() => {
    const q = norm(searchQuery.trim())
    if (!q) return [] as ListItem[]
    const places: ListItem[] = ALL_PLACES
      .filter(p => norm(`${p.title} ${p.location}`).includes(q))
      .slice(0, 4)
      .map(p => ({ ...p, kind: 'lugar' as const }))
    const comercios: ListItem[] = ALL_MAP_COMERCIOS
      .filter(c => norm(`${c.title} ${c.category}`).includes(q))
      .slice(0, 2)
      .map(c => ({ ...c, kind: 'comercio' as const, location: '', rating: 0 }))
    return [...places, ...comercios]
  }, [searchQuery])

  function handleSearchSelect(item: ListItem) {
    setSelectedId(item.id)
    setFlyToTarget({ lat: item.lat, lng: item.lng, zoom: 13 })
    setSearchQuery('')
    if (isMobile) setPanelOpen(false)
  }

  // List items — places + comercios filtered by viewport bounds, optionally sorted by proximity
  const filtered = useMemo(() => {
    let places: ListItem[] = mapPlaces.map(p => ({ ...p, kind: 'lugar' as const }))
    let comercios: ListItem[] = ALL_MAP_COMERCIOS.map(c => ({
      ...c, kind: 'comercio' as const, location: '', rating: 0,
    }))

    if (mapBounds) {
      const inBounds = (p: { lat: number; lng: number }) =>
        p.lat >= mapBounds.south && p.lat <= mapBounds.north &&
        p.lng >= mapBounds.west && p.lng <= mapBounds.east
      places = places.filter(inBounds)
      comercios = comercios.filter(inBounds)
    }

    let list = [...places, ...comercios]
    if (nearbyMode && userCoords) {
      list.sort(
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
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} en vista
        </p>

        <div className="relative mb-3">
          <MagnifyingGlass
            size={15}
            aria-hidden="true"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar un lugar..."
            aria-label="Buscar un lugar en el mapa"
            className="w-full text-sm rounded-xl py-2.5 pl-9 pr-3 outline-none"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
          />
          {searchResults.length > 0 && (
            <div
              className="absolute left-0 right-0 top-full mt-1.5 rounded-xl overflow-hidden z-10"
              style={{ background: 'var(--color-card)', boxShadow: '0 12px 32px rgba(0,0,0,0.18)', border: '1px solid var(--color-border)' }}
            >
              {searchResults.map(place => (
                <button
                  key={place.id}
                  onClick={() => handleSearchSelect(place)}
                  className="w-full text-left px-3.5 py-2.5 text-sm cursor-pointer transition-colors flex items-center gap-2"
                  style={{ color: 'var(--color-text-primary)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <MapPin size={13} aria-hidden="true" style={{ color: 'var(--color-crimson)', flexShrink: 0 }} />
                  <span className="truncate">{place.title}</span>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>· {place.location}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 pb-1">
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

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setCategoriaOpen(o => !o)}
              aria-pressed={activeCategoria !== null}
              aria-expanded={categoriaOpen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200"
              style={{
                background: activeCategoria !== null ? 'var(--color-crimson)' : 'var(--color-surface)',
                color: activeCategoria !== null ? 'white' : 'var(--color-text-muted)',
                border: activeCategoria !== null ? 'none' : '1px solid var(--color-border)',
              }}
            >
              <FunnelSimple size={12} aria-hidden="true" />
              {activeCategoria ?? 'Categoría'}
            </button>

            {categoriaOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setCategoriaOpen(false)}
                  aria-hidden="true"
                />
                <div
                  className="absolute left-0 top-full mt-1.5 rounded-xl overflow-hidden z-20"
                  style={{ background: 'var(--color-card)', boxShadow: '0 12px 32px rgba(0,0,0,0.18)', border: '1px solid var(--color-border)', minWidth: '220px' }}
                >
                  <button
                    onClick={() => { setActiveCategoria(null); setCategoriaOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors"
                    style={{
                      color: activeCategoria === null ? 'var(--color-crimson)' : 'var(--color-text-primary)',
                      fontWeight: activeCategoria === null ? 600 : 400,
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    Todos
                  </button>
                  {CATEGORIAS.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setActiveCategoria(cat); setCategoriaOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors"
                      style={{
                        color: activeCategoria === cat ? 'var(--color-crimson)' : 'var(--color-text-primary)',
                        fontWeight: activeCategoria === cat ? 600 : 400,
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map(item => {
          const isSelected = selectedId === item.id
          const detailHref = item.kind === 'comercio' ? `/red-travel/${item.id}` : `/explorar/${item.id}`

          return (
            <button
              key={`${item.kind}-${item.id}`}
              onClick={() => handleSelect(item.id)}
              className="w-full text-left px-5 py-[14px] border-b cursor-pointer transition-colors"
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
              <div className="flex items-start gap-3">
                <div
                  className="relative flex-shrink-0 rounded-xl overflow-hidden"
                  style={{ width: '64px', height: '64px', background: 'var(--color-border)' }}
                >
                  {item.image && (
                    <Image src={item.image} alt={item.title} fill className="object-cover" sizes="64px" />
                  )}
                  {item.featured && (
                    <span
                      className="absolute top-1 left-1 flex items-center justify-center rounded-full"
                      style={{ width: '16px', height: '16px', background: 'var(--color-crimson)' }}
                      aria-label="Lugar destacado"
                    >
                      <Star size={9} weight="fill" color="white" aria-hidden="true" />
                    </span>
                  )}
                  {item.kind === 'comercio' && (
                    <span
                      className="absolute bottom-1 right-1 flex items-center justify-center rounded-full text-white"
                      style={{ width: '16px', height: '16px', background: '#EA580C', fontSize: '8px', fontWeight: 700 }}
                      aria-label="Comercio Red Travel"
                    >
                      RT
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="font-semibold text-sm truncate"
                      style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-heading)' }}
                    >
                      {item.title}
                    </p>
                    {item.rating > 0 && (
                      <span className="flex items-center gap-0.5 flex-shrink-0">
                        <Star size={10} weight="fill" color="#FBBF24" aria-hidden="true" />
                        <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                          {item.rating.toFixed(1)}
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                    {item.kind === 'comercio' ? `Red Travel · ${item.category}` : `${item.category} · ${item.location}`}
                  </p>
                  {item.description && (
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {isSelected && (
                <div className="mt-3">
                  <Link
                    href={detailHref}
                    className="block text-center text-xs font-semibold py-2 rounded-lg text-white cursor-pointer transition-opacity hover:opacity-90"
                    style={{ background: item.kind === 'comercio' ? '#EA580C' : 'var(--color-crimson)' }}
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
          comercios={ALL_MAP_COMERCIOS}
          selectedId={selectedId}
          flyToTarget={flyToTarget}
          onSelect={handleSelect}
          onBoundsChange={setMapBounds}
        />

        {/* Geocoding search overlay */}
        <div
          className="absolute flex flex-col"
          style={{
            top: isMobile ? '60px' : '16px',
            right: '16px',
            left: isMobile ? '16px' : 'auto',
            width: isMobile ? undefined : '340px',
            zIndex: 10,
          }}
        >
          <div className="relative">
            <MagnifyingGlass
              size={16}
              aria-hidden="true"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              value={geoQuery}
              onChange={e => handleGeoSearch(e.target.value)}
              placeholder="Buscar dirección o lugar..."
              aria-label="Buscar dirección en el mapa"
              className="w-full text-sm rounded-xl py-3 pl-10 pr-9 outline-none"
              style={{
                background: 'var(--color-card)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
            {geoQuery && (
              <button
                onClick={() => { setGeoQuery(''); setGeoResults([]) }}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
              >
                <X size={10} weight="bold" aria-hidden="true" />
              </button>
            )}
          </div>
          {geoResults.length > 0 && (
            <div
              className="mt-1.5 rounded-xl overflow-hidden"
              style={{
                background: 'var(--color-card)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                border: '1px solid var(--color-border)',
              }}
            >
              {geoResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleGeoSelect(r)}
                  className="w-full text-left px-4 py-3 text-sm cursor-pointer transition-colors flex items-start gap-2.5"
                  style={{ color: 'var(--color-text-primary)', borderBottom: i < geoResults.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <MapPin size={14} weight="fill" aria-hidden="true" style={{ color: 'var(--color-crimson)', flexShrink: 0, marginTop: '2px' }} />
                  <span className="line-clamp-2 leading-snug">{r.place_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

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
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
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
