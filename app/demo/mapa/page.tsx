'use client'

import dynamic from 'next/dynamic'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { Star, MapPin } from '@phosphor-icons/react'
import Image from 'next/image'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { LUGARES } from '@/lib/data'
import type { MapPlace } from '@/app/mapa/page'

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3" style={{ background: 'var(--color-map-placeholder)' }}>
      <div className="w-10 h-10 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--color-crimson)', borderTopColor: 'transparent' }} />
      <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Cargando mapa...</span>
    </div>
  ),
})

const PV_LUGARES = LUGARES.filter(l => l.destinoId === 'puerto-varas' && l.lat !== undefined && l.lng !== undefined)
const CATEGORIES = ['Todos', ...new Set(PV_LUGARES.map(l => l.category))]

interface Bounds { north: number; south: number; east: number; west: number }

export default function DemoMapaPage() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [mapBounds, setMapBounds] = useState<Bounds | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom?: number } | null>({ lat: -41.319, lng: -72.985, zoom: 11 })

  useEffect(() => {
    const timer = setTimeout(() => setFlyTo(null), 2000)
    return () => clearTimeout(timer)
  }, [])

  const mapPlaces: MapPlace[] = useMemo(() => {
    const list = activeCategory === 'Todos' ? PV_LUGARES : PV_LUGARES.filter(p => p.category === activeCategory)
    return list.map(l => ({
      id: l.id, title: l.title, image: l.image, category: l.category,
      location: l.location, lat: l.lat!, lng: l.lng!, rating: l.rating,
    }))
  }, [activeCategory])

  const filtered = useMemo(() => {
    let list = activeCategory === 'Todos' ? PV_LUGARES : PV_LUGARES.filter(p => p.category === activeCategory)
    if (mapBounds) {
      list = list.filter(p =>
        p.lat! >= mapBounds.south && p.lat! <= mapBounds.north &&
        p.lng! >= mapBounds.west && p.lng! <= mapBounds.east
      )
    }
    return list
  }, [activeCategory, mapBounds])

  const handleBoundsChange = useCallback((b: Bounds) => setMapBounds(b), [])

  return (
    <div className="flex h-[calc(100dvh-64px)] overflow-hidden" style={{ background: 'var(--color-surface)' }}>
      {/* Side panel */}
      <div className="hidden md:flex flex-col overflow-hidden flex-shrink-0 border-r" style={{ width: '360px', background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="px-5 pt-5 pb-4 border-b flex-shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <h1 className="font-bold text-lg mb-3" style={{ fontFamily: 'var(--font-family-display)', color: 'var(--color-text-primary)' }}>
            Mapa
          </h1>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150"
                style={{
                  background: activeCategory === cat ? 'var(--color-crimson)' : 'transparent',
                  color: activeCategory === cat ? 'white' : 'var(--color-text-muted)',
                  border: `1px solid ${activeCategory === cat ? 'var(--color-crimson)' : 'var(--color-border)'}`,
                  cursor: 'pointer',
                }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {filtered.length} atractivo{filtered.length !== 1 ? 's' : ''} en esta vista
            </p>
          </div>
          <div className="px-3 pb-4 flex flex-col gap-1.5">
            {filtered.map(l => (
              <TransitionLink key={l.id} href={`/demo/atractivos/${l.id}`} className="flex gap-3 p-2.5 rounded-xl transition-colors"
                style={{ textDecoration: 'none', background: selectedId === l.id ? 'var(--color-crimson-light)' : 'transparent' }}
                onMouseEnter={() => setSelectedId(l.id)} onMouseLeave={() => setSelectedId(null)}>
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ background: 'var(--color-border)' }}>
                  <Image src={l.image} alt={l.title} width={56} height={56} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-heading)' }}>
                    {l.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
                      {l.category}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Star size={9} weight="fill" color="#dca102" />
                      <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{l.rating.toFixed(1)}</span>
                    </span>
                  </div>
                </div>
              </TransitionLink>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapView
          places={mapPlaces}
          selectedId={selectedId}
          flyToTarget={flyTo}
          onSelect={setSelectedId}
          onBoundsChange={handleBoundsChange}
        />
      </div>
    </div>
  )
}
