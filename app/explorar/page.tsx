'use client'

import Image from 'next/image'
import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import {
  Star, Compass,
  CaretLeft, CaretRight,
} from '@phosphor-icons/react'
import { SearchBar } from '@/components/ui/SearchBar'
import { Card } from '@/components/ui/Card'
import { RouteCard } from '@/components/ui/RouteCard'
import { Tabs } from '@/components/ui/Tabs'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useFavorites } from '@/hooks/useFavorites'
import { useNearby, haversineKm } from '@/hooks/useNearby'
import { LUGARES as ALL_LUGARES, DESTINOS as ALL_DESTINOS, RUTAS, findDestino as findDest } from '@/lib/data'
import { useFilters, TaxonomyChips, TaxonomyModal, applyTaxonomyFilters } from '@/components/ui/TaxonomyFilters'

// ─── Datos ────────────────────────────────────────────────────────────────────

const CAROUSEL_DESTINOS = ALL_DESTINOS.filter(d => d.image)
const DESTINOS = ALL_DESTINOS
const MAX_ITEMS = 50

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

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
            style={{ opacity: i === current ? 1 : 0, transition: 'opacity 0.6s ease' }}
            priority={i === 0}
            sizes="(max-width: 768px) 100vw, 80vw"
          />
        ))}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)' }} />

        {/* Dots */}
        <div
          className="absolute flex items-center gap-1.5"
          style={{ bottom: '18px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}
          role="tablist"
          aria-label="Indicadores de destino"
        >
          {CAROUSEL_DESTINOS.map((dest, i) => (
            <button
              key={dest.id}
              onClick={e => { e.preventDefault(); e.stopPropagation(); goTo(i) }}
              role="tab"
              aria-selected={i === current}
              aria-label={`Ir a destino ${i + 1}`}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? '20px' : '6px',
                height: '6px',
                background: i === current ? 'white' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>

        <span
          className="absolute top-5 left-5 text-[10px] font-bold uppercase px-3 py-1 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(6px)',
            color: 'white', letterSpacing: '0.12em', fontFamily: 'var(--font-family-heading)',
          }}
        >
          Destino recomendado
        </span>

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
  const [query, setQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const { favorites, toggleFavorite } = useFavorites()
  const revealRef = useScrollReveal()
  const filters = useFilters()
  const { userCoords, nearbyMode, nearbyLoading, toggleNearby } = useNearby()

  const hasActiveFilters = query.trim() !== '' || filters.hasFilters

  const filteredLugares = useMemo(() => {
    let matched = applyTaxonomyFilters(ALL_LUGARES, filters.state)
    if (query.trim()) {
      const q = norm(query.trim())
      matched = matched.filter(l => norm(`${l.title} ${l.location} ${l.category}`).includes(q))
    }
    if (nearbyMode && userCoords) {
      matched.sort((a, b) => {
        const da = (typeof a.lat === 'number' && typeof a.lng === 'number')
          ? haversineKm(userCoords.lat, userCoords.lng, a.lat, a.lng) : Infinity
        const db = (typeof b.lat === 'number' && typeof b.lng === 'number')
          ? haversineKm(userCoords.lat, userCoords.lng, b.lat, b.lng) : Infinity
        return da - db
      })
    } else {
      matched.sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))
    }
    return matched
  }, [query, filters.state, nearbyMode, userCoords])

  const filteredDestinos = useMemo(() => {
    if (query.trim() === '') return DESTINOS
    const q = norm(query.trim())
    return DESTINOS.filter(d => norm(`${d.title} ${d.location} ${d.category}`).includes(q))
  }, [query])

  const filteredRutas = useMemo(() => {
    if (query.trim() === '') return RUTAS
    const q = norm(query.trim())
    return RUTAS.filter(r => {
      const destino = findDest(r.destinoId)
      return norm(`${r.title} ${r.description} ${destino?.title ?? ''}`).includes(q)
    })
  }, [query])

  const noResults = filteredLugares.length === 0 && filteredDestinos.length === 0 && filteredRutas.length === 0

  const clearFilters = () => {
    setQuery('')
    filters.clearAll()
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

      {/* Search + Taxonomy filters */}
      <div className="reveal px-5 sm:px-8 lg:px-12 pb-6" data-delay="50">
        <div className="mb-4">
          <SearchBar value={query} onChange={setQuery} placeholder="Buscar lugares, destinos, rutas..." />
        </div>
        <TaxonomyChips
          state={filters.state}
          setCategoria={filters.setCategoria}
          setTipoPunto={filters.setTipoPunto}
          setPais={filters.setPais}
          setCiudad={filters.setCiudad}
          activeCount={filters.activeCount}
          onOpenModal={() => setShowModal(true)}
          onNearby={toggleNearby}
          nearbyActive={nearbyMode}
          nearbyLoading={nearbyLoading}
        />
      </div>

      {/* Taxonomy modal */}
      {showModal && (
        <TaxonomyModal
          {...filters}
          resultCount={filteredLugares.length}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Carousel de destinos destacados */}
      {!hasActiveFilters && (
        <div className="px-5 sm:px-8 lg:px-12">
          <DestinoCarousel />
        </div>
      )}

      {/* Tabs */}
      <div className="reveal px-5 sm:px-8 lg:px-12 pb-8" data-delay="100">
        <Tabs tabs={TABS} activeId={activeTab} onChange={id => setActiveTab(id as typeof activeTab)} />
      </div>

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
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 360px))', gap: '24px' }}>
                {filteredLugares.slice(0, MAX_ITEMS).map((lugar, i) => (
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
              {filteredLugares.length > MAX_ITEMS && (
                <div className="flex justify-center pt-10">
                  <TransitionLink
                    href="/lugares"
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{
                      background: 'var(--color-crimson)',
                      color: 'white',
                      fontFamily: 'var(--font-family-heading)',
                    }}
                  >
                    Ver todos los lugares
                    <CaretRight size={14} weight="bold" aria-hidden="true" />
                  </TransitionLink>
                </div>
              )}
            </>
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
