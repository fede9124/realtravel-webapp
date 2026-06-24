'use client'

import Image from 'next/image'
import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import {
  MapPin, Globe, Buildings, Star, Compass,
  Mountains, Bank, Waves, ForkKnife, Palette, Tent,
  CaretLeft, CaretRight, SlidersHorizontal, X,
} from '@phosphor-icons/react'
import { SearchBar } from '@/components/ui/SearchBar'
import { Card } from '@/components/ui/Card'
import { RouteCard } from '@/components/ui/RouteCard'
import { Tabs } from '@/components/ui/Tabs'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useFavorites } from '@/hooks/useFavorites'
import { LUGARES as ALL_LUGARES, DESTINOS as ALL_DESTINOS, RUTAS, findDestino as findDest } from '@/lib/data'

// ─── Datos ────────────────────────────────────────────────────────────────────

const LOCATION_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'cerca', label: 'Cerca de mí', Icon: MapPin },
  { id: 'pais', label: 'País', Icon: Globe },
  { id: 'ciudad', label: 'Ciudad', Icon: Buildings },
]

const RATING_FILTERS = [
  { id: 0, label: 'Todas' },
  { id: 4, label: '4.0+' },
  { id: 4.5, label: '4.5+' },
]

const MOODS = [
  { id: 'aventura',    label: 'Aventura',    Icon: Mountains },
  { id: 'historia',   label: 'Historia',    Icon: Bank },
  { id: 'relajo',      label: 'Relajo',      Icon: Waves },
  { id: 'gastronomia', label: 'Gastronomía', Icon: ForkKnife },
  { id: 'cultura',     label: 'Cultura',     Icon: Palette },
  { id: 'naturaleza',  label: 'Naturaleza',  Icon: Tent },
]

// Destinos para el carousel — todos los DESTINOS con imagen
const CAROUSEL_DESTINOS = ALL_DESTINOS.filter(d => d.image)

type Explorable = (typeof ALL_LUGARES[number] | typeof ALL_DESTINOS[number])

const LUGARES = ALL_LUGARES.filter(l => l.distance)
const DESTINOS = ALL_DESTINOS

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Carousel ─────────────────────────────────────────────────────────────────

function DestinoCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const total = CAROUSEL_DESTINOS.length

  const goTo = useCallback((idx: number) => {
    setCurrent((idx + total) % total)
  }, [total])

  useEffect(() => {
    if (paused) return
    timerRef.current = setTimeout(() => goTo(current + 1), 5000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [current, paused, goTo])

  const d = CAROUSEL_DESTINOS[current]

  return (
    <div
      className="reveal pb-12 relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Hero */}
      <TransitionLink
        href={`/destinos/${d.id}`}
        className="group block relative overflow-hidden rounded-2xl"
        aria-label={`Ver destino: ${d.title}`}
        style={{ height: 'clamp(320px, 44vh, 480px)' }}
      >
        {CAROUSEL_DESTINOS.map((dest, i) => (
          <Image
            key={dest.id}
            src={dest.image}
            alt={dest.title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) calc(100vw - 240px), 100vw"
            priority={i === 0}
            style={{
              opacity: i === current ? 1 : 0,
              transition: 'opacity 0.7s ease',
            }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 50%, transparent 100%)' }}
          aria-hidden="true"
        />

        {/* Badge */}
        <div className="absolute top-6 left-5 sm:left-7">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
            style={{ background: 'var(--color-crimson)', fontFamily: 'var(--font-family-heading)', letterSpacing: '0.05em' }}
          >
            <Star size={10} weight="fill" aria-hidden="true" />
            Destino recomendado
          </span>
        </div>

        {/* Dot indicators */}
        <div
          className="absolute top-6 right-5 sm:right-7 flex items-center gap-1.5"
          onClick={e => e.preventDefault()}
          aria-label="Indicadores de destino"
        >
          {CAROUSEL_DESTINOS.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.preventDefault(); e.stopPropagation(); goTo(i) }}
              aria-label={`Ir a destino ${i + 1}`}
              className="transition-all duration-300"
              style={{
                width: i === current ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === current ? 'white' : 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div
          className="absolute bottom-8 left-5 right-5 sm:left-7 sm:right-auto"
          style={{ maxWidth: '46ch' }}
        >
          <p
            className="text-white/65 font-semibold mb-1.5 uppercase"
            style={{ fontFamily: 'var(--font-family-heading)', fontSize: '11px', letterSpacing: '0.14em' }}
          >
            {d.country}
          </p>
          <h2
            className="text-white font-extrabold leading-none mb-3"
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'clamp(2.5rem, 4.5vw, 4.5rem)',
              letterSpacing: '-0.015em',
            }}
          >
            {d.title}
          </h2>
          <p
            className="text-white/70 leading-relaxed mb-4 line-clamp-2"
            style={{ fontFamily: 'var(--font-family-body)', fontSize: '15px', maxWidth: '34ch' }}
          >
            {d.editorial}
          </p>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <Star size={13} weight="fill" color="#FBBF24" aria-hidden="true" />
              <span className="text-white font-bold text-sm">{d.rating}</span>
              <span className="text-white/55 text-xs">({d.reviewCount.toLocaleString('es')})</span>
            </div>
            <span
              className="text-sm font-semibold text-white px-4 py-2 rounded-full transition-all group-hover:bg-white/25"
              style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(6px)', fontFamily: 'var(--font-family-heading)' }}
            >
              Ver destino →
            </span>
          </div>
        </div>
      </TransitionLink>

      {/* Prev / Next buttons */}
      <div className="absolute bottom-20 right-5 sm:right-7 flex gap-2" style={{ zIndex: 10 }}>
        <button
          onClick={() => goTo(current - 1)}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer' }}
          aria-label="Destino anterior"
        >
          <CaretLeft size={15} weight="bold" aria-hidden="true" />
        </button>
        <button
          onClick={() => goTo(current + 1)}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer' }}
          aria-label="Destino siguiente"
        >
          <CaretRight size={15} weight="bold" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExplorarPage() {
  const [activeTab, setActiveTab] = useState<'lugares' | 'destinos' | 'rutas'>('lugares')
  const [activeFilter, setActiveFilter] = useState('todos')
  const [activeMood, setActiveMood] = useState<string | null>(null)
  const [ratingMin, setRatingMin] = useState(0)
  const [query, setQuery] = useState('')
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const { favorites, toggleFavorite } = useFavorites()
  const revealRef = useScrollReveal()

  useEffect(() => {
    if (activeFilter !== 'cerca' || userCoords) return
    navigator.geolocation?.getCurrentPosition(
      pos => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 6000 }
    )
  }, [activeFilter, userCoords])

  const hasActiveFilters = query.trim() !== '' || activeMood !== null || activeFilter !== 'todos' || ratingMin > 0
  const extraFiltersCount = (activeFilter !== 'todos' ? 1 : 0) + (ratingMin > 0 ? 1 : 0)

  const matches = (item: Explorable) => {
    if (query.trim() !== '') {
      const haystack = norm(`${item.title} ${item.location} ${item.category}`)
      if (!haystack.includes(norm(query.trim()))) return false
    }
    if (activeMood && !item.moods.includes(activeMood)) return false
    if (ratingMin > 0 && item.rating < ratingMin) return false
    if (activeFilter === 'cerca') {
      if (!userCoords) return false
      const lat = (item as { lat?: number }).lat
      const lng = (item as { lng?: number }).lng
      if (typeof lat !== 'number' || typeof lng !== 'number') return false
      if (haversineKm(userCoords.lat, userCoords.lng, lat, lng) > 200) return false
    }
    if (activeFilter === 'pais' && item.category !== 'País') return false
    if (activeFilter === 'ciudad' && item.category !== 'Ciudad') return false
    return true
  }

  const filteredLugares = useMemo(() => LUGARES.filter(matches), [query, activeMood, activeFilter, ratingMin, userCoords])
  const filteredDestinos = useMemo(() => DESTINOS.filter(matches), [query, activeMood, activeFilter, ratingMin, userCoords])

  const filteredRutas = useMemo(() => {
    if (activeMood || activeFilter !== 'todos' || ratingMin > 0) return []
    if (query.trim() === '') return RUTAS
    const q = norm(query.trim())
    return RUTAS.filter(r => {
      const destino = findDest(r.destinoId)
      return norm(`${r.title} ${r.description} ${destino?.title ?? ''}`).includes(q)
    })
  }, [query, activeMood, activeFilter, ratingMin])

  const noResults = filteredLugares.length === 0 && filteredDestinos.length === 0 && filteredRutas.length === 0

  const clearFilters = () => {
    setQuery('')
    setActiveMood(null)
    setActiveFilter('todos')
    setRatingMin(0)
  }

  const TABS = [
    { id: 'lugares', label: 'Lugares', count: filteredLugares.length },
    { id: 'destinos', label: 'Destinos', count: filteredDestinos.length },
    { id: 'rutas', label: 'Rutas', count: filteredRutas.length },
  ]

  return (
    <div ref={revealRef} className="w-full pb-24">

      {/* Header */}
      <div className="reveal px-5 sm:px-8 lg:px-12 pt-14 pb-3">
        <h1
          style={{
            fontFamily: 'var(--font-family-display)',
            color: 'var(--color-text-primary)',
            fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
            fontWeight: 600,
          }}
        >
          Explorar
        </h1>
      </div>

      {/* Filtros — todo arriba del contenido */}
      <div className="reveal px-5 sm:px-8 lg:px-12 pb-6" data-delay="50">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <SearchBar value={query} onChange={setQuery} placeholder="Buscar lugares, destinos, rutas..." />
          </div>
          <button
            onClick={() => setShowMoreFilters(true)}
            aria-label="Abrir más filtros"
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
            style={{
              background: extraFiltersCount > 0 ? 'var(--color-crimson)' : 'var(--color-surface)',
              color: extraFiltersCount > 0 ? 'white' : 'var(--color-text-muted)',
              border: extraFiltersCount > 0 ? 'none' : '1px solid var(--color-border)',
            }}
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
            Más filtros
            {extraFiltersCount > 0 && (
              <span
                className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.25)' }}
              >
                {extraFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Mood chips */}
        <div className="flex gap-2 overflow-x-auto scroll-hide">
          {MOODS.map(({ id, label, Icon }) => {
            const active = activeMood === id
            return (
              <button
                key={id}
                onClick={() => setActiveMood(active ? null : id)}
                aria-pressed={active}
                className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 active:scale-95"
                style={{
                  background: active ? 'var(--color-crimson)' : 'var(--color-surface)',
                  color: active ? 'white' : 'var(--color-text-muted)',
                  border: active ? 'none' : '1px solid var(--color-border)',
                }}
              >
                <Icon size={11} weight={active ? 'fill' : 'regular'} aria-hidden="true" />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Modal: más filtros */}
      {showMoreFilters && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowMoreFilters(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: 'var(--color-card)', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-base" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-heading)' }}>
                Más filtros
              </h2>
              <button
                onClick={() => setShowMoreFilters(false)}
                aria-label="Cerrar filtros"
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface)' }}
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>

            <p className="text-xs font-bold uppercase mb-2.5" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
              Ubicación
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              {LOCATION_FILTERS.map(({ id, label, Icon }) => {
                const active = activeFilter === id
                return (
                  <button
                    key={id}
                    onClick={() => setActiveFilter(id)}
                    aria-pressed={active}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all"
                    style={{
                      background: active ? 'var(--color-crimson)' : 'var(--color-surface)',
                      color: active ? 'white' : 'var(--color-text-muted)',
                      border: active ? 'none' : '1px solid var(--color-border)',
                    }}
                  >
                    {Icon && <Icon size={13} aria-hidden="true" />}
                    {label}
                  </button>
                )
              })}
            </div>

            <p className="text-xs font-bold uppercase mb-2.5" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
              Calificación mínima
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {RATING_FILTERS.map(({ id, label }) => {
                const active = ratingMin === id
                return (
                  <button
                    key={id}
                    onClick={() => setRatingMin(id)}
                    aria-pressed={active}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all"
                    style={{
                      background: active ? 'var(--color-crimson)' : 'var(--color-surface)',
                      color: active ? 'white' : 'var(--color-text-muted)',
                      border: active ? 'none' : '1px solid var(--color-border)',
                    }}
                  >
                    {id > 0 && <Star size={12} weight="fill" aria-hidden="true" />}
                    {label}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => { setActiveFilter('todos'); setRatingMin(0); setShowMoreFilters(false) }}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ color: 'var(--color-crimson)', background: 'var(--color-crimson-light)' }}
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="reveal px-5 sm:px-8 lg:px-12 pb-8" data-delay="100">
        <Tabs tabs={TABS} activeId={activeTab} onChange={id => setActiveTab(id as typeof activeTab)} />
      </div>

      {/* Carousel — solo en tab Destinos, sin filtros activos */}
      {activeTab === 'destinos' && !hasActiveFilters && (
        <div className="px-5 sm:px-8 lg:px-12">
          <DestinoCarousel />
        </div>
      )}

      {/* Sin resultados */}
      {noResults && hasActiveFilters ? (
        <div className="px-5 sm:px-8 lg:px-12 pb-24">
          <div
            className="flex flex-col items-center justify-center gap-6 px-6 py-20 rounded-2xl"
            style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
            role="status"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--color-crimson-light)' }}
            >
              <Compass size={30} weight="regular" style={{ color: 'var(--color-crimson)' }} aria-hidden="true" />
            </div>
            <div className="text-center max-w-sm">
              <h2 className="font-bold text-lg mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
                Sin resultados
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {query.trim() !== ''
                  ? `No encontramos resultados para "${query.trim()}".`
                  : 'Ningún elemento coincide con los filtros seleccionados.'}
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'var(--color-crimson)' }}
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      ) : (
        <div className="px-5 sm:px-8 lg:px-12">

          {/* Tab: Lugares */}
          {activeTab === 'lugares' && filteredLugares.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 360px))', gap: '24px' }}>
              {filteredLugares.map((lugar, i) => (
                <Card
                  key={lugar.id}
                  {...lugar}
                  revealDelay={i * 30}
                  priority={i === 0}
                  isFavorite={favorites.has(lugar.id)}
                  onFavoriteToggle={() => toggleFavorite(lugar.id)}
                />
              ))}
            </div>
          )}

          {/* Tab: Destinos */}
          {activeTab === 'destinos' && filteredDestinos.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 360px))', gap: '24px' }}>
              {filteredDestinos.map((destino, i) => (
                <Card
                  key={destino.id}
                  {...destino}
                  href={`/destinos/${destino.id}`}
                  revealDelay={i * 30}
                  priority={i === 0}
                  isFavorite={favorites.has(destino.id)}
                  onFavoriteToggle={() => toggleFavorite(destino.id)}
                />
              ))}
            </div>
          )}

          {/* Tab: Rutas */}
          {activeTab === 'rutas' && filteredRutas.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 360px))', gap: '24px' }}>
              {filteredRutas.map((ruta, i) => {
                const destino = findDest(ruta.destinoId)
                return (
                  <RouteCard
                    key={ruta.id}
                    {...ruta}
                    destinoTitle={destino?.title}
                    revealDelay={i * 30}
                    isFavorite={favorites.has(ruta.id)}
                    onFavoriteToggle={() => toggleFavorite(ruta.id)}
                  />
                )
              })}
            </div>
          )}

        </div>
      )}

    </div>
  )
}
