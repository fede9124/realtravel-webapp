'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  MapPin, Globe, Buildings, Star, Compass, Path,
  Mountains, Bank, Waves, ForkKnife, Palette, Tent,
  CaretLeft, CaretRight, ArrowRight,
} from '@phosphor-icons/react'
import { SearchBar } from '@/components/ui/SearchBar'
import { ChipFilter } from '@/components/ui/ChipFilter'
import { Card } from '@/components/ui/Card'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useFavorites } from '@/hooks/useFavorites'
import { LUGARES as ALL_LUGARES, DESTINOS as ALL_DESTINOS, RUTAS, findLugar, findDestino as findDest } from '@/lib/data'

// ─── Datos ────────────────────────────────────────────────────────────────────

const LOCATION_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'cerca', label: 'Cerca de mí', Icon: MapPin },
  { id: 'pais', label: 'País', Icon: Globe },
  { id: 'ciudad', label: 'Ciudad', Icon: Buildings },
]

const MOODS = [
  { id: 'aventura',    label: 'Aventura',    Icon: Mountains, bg: '#1a1a2e', accent: '#e94560' },
  { id: 'historia',   label: 'Historia',    Icon: Bank,      bg: '#2c2416', accent: '#d4a853' },
  { id: 'relajo',      label: 'Relajo',      Icon: Waves,     bg: '#0f2133', accent: '#4db6e4' },
  { id: 'gastronomia', label: 'Gastronomía', Icon: ForkKnife, bg: '#1e1108', accent: '#e07b39' },
  { id: 'cultura',     label: 'Cultura',     Icon: Palette,   bg: '#1a0d2e', accent: '#9b59b6' },
  { id: 'naturaleza',  label: 'Naturaleza',  Icon: Tent,      bg: '#0d1f0d', accent: '#4caf50' },
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
      className="reveal pb-16"
      data-delay="100"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Hero */}
      <TransitionLink
        href={`/destinos/${d.id}`}
        className="group block relative overflow-hidden"
        aria-label={`Ver destino: ${d.title}`}
        style={{ height: 'clamp(360px, 52vh, 580px)' }}
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
              transitionDelay: i === current ? '0ms' : '0ms',
            }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 50%, transparent 100%)' }}
          aria-hidden="true"
        />

        {/* Badge */}
        <div className="absolute top-8 left-5 sm:left-8 lg:left-12">
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
          className="absolute top-8 right-5 sm:right-8 lg:right-12 flex items-center gap-1.5"
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
          className="absolute bottom-10 left-5 right-5 sm:left-8 sm:right-auto lg:left-12"
          style={{ maxWidth: '46ch' }}
        >
          <p
            className="text-white/65 font-semibold mb-1.5 uppercase"
            style={{ fontFamily: 'var(--font-family-heading)', fontSize: '11px', letterSpacing: '0.14em' }}
          >
            {d.country}
          </p>
          <h2
            className="text-white font-extrabold leading-none mb-4"
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'clamp(3rem, 5vw, 5.5rem)',
              letterSpacing: '-0.015em',
            }}
          >
            {d.title}
          </h2>
          <p
            className="text-white/70 leading-relaxed mb-5 line-clamp-2"
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
      <div className="absolute bottom-24 right-5 sm:right-8 lg:right-12 flex gap-2" style={{ zIndex: 10 }}>
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
  const [activeFilter, setActiveFilter] = useState('todos')
  const [activeMood, setActiveMood] = useState<string | null>(null)
  const [query, setQuery] = useState('')
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

  const hasActiveFilters = query.trim() !== '' || activeMood !== null || activeFilter !== 'todos'

  const matches = (item: Explorable) => {
    if (query.trim() !== '') {
      const haystack = norm(`${item.title} ${item.location} ${item.category}`)
      if (!haystack.includes(norm(query.trim()))) return false
    }
    if (activeMood && !item.moods.includes(activeMood)) return false
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

  // Always limit to 2 items in explorar view; "Ver todo" goes to dedicated pages
  const filteredLugares = useMemo(() => LUGARES.filter(matches), [query, activeMood, activeFilter, userCoords])
  const filteredDestinos = useMemo(() => DESTINOS.filter(matches), [query, activeMood, activeFilter, userCoords])

  const filteredRutas = useMemo(() => {
    if (activeMood || activeFilter !== 'todos') return []
    if (query.trim() === '') return RUTAS
    const q = norm(query.trim())
    return RUTAS.filter(r => {
      const destino = findDest(r.destinoId)
      return norm(`${r.title} ${r.description} ${destino?.title ?? ''}`).includes(q)
    })
  }, [query, activeMood, activeFilter])

  const router = useRouter()
  const noResults = filteredLugares.length === 0 && filteredDestinos.length === 0 && filteredRutas.length === 0

  const clearFilters = () => {
    setQuery('')
    setActiveMood(null)
    setActiveFilter('todos')
  }

  return (
    <div ref={revealRef} className="w-full">

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

      {/* Search + location chips */}
      <div className="reveal px-5 sm:px-8 lg:px-12 pb-12" data-delay="50">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <ChipFilter chips={LOCATION_FILTERS} activeId={activeFilter} onChange={setActiveFilter} className="flex-shrink-0" />
          <div className="sm:ml-auto w-full sm:w-64 lg:w-72">
            <SearchBar value={query} onChange={setQuery} placeholder="Buscar lugares, ciudades..." />
          </div>
        </div>
      </div>

      {/* Carousel (always shown, no filtros) */}
      {!hasActiveFilters && (
        <div className="relative">
          <DestinoCarousel />
        </div>
      )}

      {/* Mood filters */}
      <div className="reveal px-5 sm:px-8 lg:px-12 pb-16" data-delay="140">
        <p
          className="text-xs font-bold uppercase mb-5"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-heading)', letterSpacing: '0.12em' }}
        >
          ¿Qué tipo de viaje buscas?
        </p>
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(170px, 100%), 1fr))' }}
        >
          {MOODS.map(({ id, label, Icon, bg, accent }) => {
            const active = activeMood === id
            return (
              <button
                key={id}
                onClick={() => setActiveMood(active ? null : id)}
                aria-pressed={active}
                className="flex items-center gap-3.5 px-5 rounded-lg cursor-pointer transition-all duration-200 active:scale-[0.97] text-left"
                style={{
                  height: '72px',
                  background: active ? bg : 'var(--color-card)',
                  boxShadow: active ? 'none' : 'var(--shadow-card)',
                  border: active ? `1px solid ${accent}33` : '1px solid var(--color-border)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: active ? 'rgba(255,255,255,0.12)' : 'var(--color-crimson-light)' }}
                >
                  <Icon size={19} weight={active ? 'fill' : 'regular'} aria-hidden="true" style={{ color: active ? accent : 'var(--color-crimson)' }} />
                </div>
                <span
                  className="text-sm font-bold leading-tight truncate"
                  style={{ color: active ? 'white' : 'var(--color-text-primary)', fontFamily: 'var(--font-family-heading)', letterSpacing: '-0.01em' }}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Sin resultados */}
      {noResults && hasActiveFilters && (
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
                  : 'Ningún lugar coincide con los filtros seleccionados.'}
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
      )}

      {/* Lugares — 1 fila, tantos como entren */}
      {filteredLugares.length > 0 && (
        <section aria-labelledby="heading-lugares" className="px-5 sm:px-8 lg:px-12 pb-16">
          <SectionHeader
            id="heading-lugares"
            title="Lugares"
            total={filteredLugares.length}
            href="/lugares"
          />
          <HScrollRow>
            {filteredLugares.slice(0, 8).map((lugar, i) => (
              <Card
                key={lugar.id}
                {...lugar}
                revealDelay={i * 60}
                priority={i === 0}
                isFavorite={favorites.has(lugar.id)}
                onFavoriteToggle={() => toggleFavorite(lugar.id)}
                style={{ flex: '0 0 280px' }}
              />
            ))}
          </HScrollRow>
          <div className="mt-8 text-center">
            <TransitionLink
              href="/lugares"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'var(--color-crimson)', color: 'white', fontFamily: 'var(--font-family-heading)' }}
            >
              Ver todos los lugares ({filteredLugares.length})
              <ArrowRight size={15} weight="bold" aria-hidden="true" />
            </TransitionLink>
          </div>
        </section>
      )}

      {/* Destinos — 1 fila, tantos como entren */}
      {filteredDestinos.length > 0 && (
        <section aria-labelledby="heading-destinos" className="px-5 sm:px-8 lg:px-12 pb-16">
          <SectionHeader
            id="heading-destinos"
            title="Destinos"
            total={filteredDestinos.length}
            href="/destinos"
          />
          <HScrollRow>
            {filteredDestinos.slice(0, 8).map((destino, i) => (
              <Card
                key={destino.id}
                {...destino}
                href={`/destinos/${destino.id}`}
                revealDelay={i * 60}
                isFavorite={favorites.has(destino.id)}
                onFavoriteToggle={() => toggleFavorite(destino.id)}
                style={{ flex: '0 0 280px' }}
              />
            ))}
          </HScrollRow>
          <div className="mt-8 text-center">
            <TransitionLink
              href="/destinos"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'var(--color-crimson)', color: 'white', fontFamily: 'var(--font-family-heading)' }}
            >
              Ver todos los destinos ({filteredDestinos.length})
              <ArrowRight size={15} weight="bold" aria-hidden="true" />
            </TransitionLink>
          </div>
        </section>
      )}

      {/* Rutas — 1 fila, tantos como entren */}
      {filteredRutas.length > 0 && (
        <section aria-labelledby="heading-rutas" className="px-5 sm:px-8 lg:px-12 pb-24">
          <SectionHeader
            id="heading-rutas"
            title="Rutas"
            total={filteredRutas.length}
            href="/rutas"
          />
          <HScrollRow gap="20px">
            {filteredRutas.slice(0, 6).map(ruta => {
              const destino = findDest(ruta.destinoId)
              const stops = ruta.stops.map(findLugar).filter(Boolean)
              return (
                <div
                  key={ruta.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/rutas/${ruta.id}`)}
                  onKeyDown={e => e.key === 'Enter' && router.push(`/rutas/${ruta.id}`)}
                  className="reveal rounded-2xl p-6 cursor-pointer transition-shadow hover:shadow-lg"
                  style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)', flex: '0 0 340px' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p
                        className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                        style={{ color: 'var(--color-crimson)', fontFamily: 'var(--font-family-heading)', letterSpacing: '0.1em' }}
                      >
                        {destino?.title ?? ruta.destinoId}
                      </p>
                      <h3
                        className="text-lg font-bold"
                        style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-display)' }}
                      >
                        {ruta.title}
                      </h3>
                    </div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--color-crimson-light)' }}
                    >
                      <Path size={18} weight="regular" style={{ color: 'var(--color-crimson)' }} aria-hidden="true" />
                    </div>
                  </div>
                  <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                    {ruta.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {[ruta.duration, ruta.distance, `${ruta.stops.length} paradas`].map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 rounded-lg font-medium"
                        style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    {stops.map((lugar, i) => lugar && (
                      <div key={lugar.id} className="flex items-center gap-2.5">
                        <div className="flex flex-col items-center">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                            style={{ background: 'var(--color-crimson)', fontFamily: 'var(--font-family-heading)' }}
                          >
                            {i + 1}
                          </div>
                          {i < stops.length - 1 && (
                            <div className="w-px h-3" style={{ background: 'var(--color-border)' }} />
                          )}
                        </div>
                        <Link
                          href={`/explorar/${lugar.id}`}
                          className="text-sm font-medium hover:underline"
                          style={{ color: 'var(--color-text-primary)' }}
                          onClick={e => e.stopPropagation()}
                        >
                          {lugar.title}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </HScrollRow>
          <div className="mt-8 text-center">
            <TransitionLink
              href="/rutas"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'var(--color-crimson)', color: 'white', fontFamily: 'var(--font-family-heading)' }}
            >
              Ver todas las rutas ({filteredRutas.length})
              <ArrowRight size={15} weight="bold" aria-hidden="true" />
            </TransitionLink>
          </div>
        </section>
      )}

    </div>
  )
}

// ─── Horizontal scroll row with prev/next arrows ─────────────────────────────

function HScrollRow({ children, gap = '24px' }: { children: React.ReactNode; gap?: string }) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  useEffect(() => {
    const el = rowRef.current
    if (!el) return
    const update = () => {
      setCanLeft(el.scrollLeft > 4)
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])

  const scroll = (dir: 'left' | 'right') =>
    rowRef.current?.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' })

  const FADE_W = 80
  const btnStyle = (side: 'left' | 'right'): React.CSSProperties => ({
    position: 'absolute',
    [side]: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 20,
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    background: 'var(--color-card)',
    color: 'var(--color-text-primary)',
    boxShadow: 'var(--shadow-card)',
    border: '1px solid var(--color-border)',
    transition: 'transform 150ms ease, box-shadow 150ms ease',
  })

  return (
    <div style={{ position: 'relative' }}>
      {/* Gradient fades */}
      {canLeft && (
        <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${FADE_W}px`, zIndex: 10, pointerEvents: 'none', background: 'linear-gradient(to right, var(--color-surface) 30%, transparent)' }} />
      )}
      {canRight && (
        <div aria-hidden="true" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${FADE_W}px`, zIndex: 10, pointerEvents: 'none', background: 'linear-gradient(to left, var(--color-surface) 30%, transparent)' }} />
      )}

      {/* Scroll container */}
      <div ref={rowRef} style={{ display: 'flex', flexWrap: 'nowrap', gap, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
        {children}
      </div>

      {/* Arrow buttons */}
      {canLeft && (
        <button onClick={() => scroll('left')} aria-label="Desplazar izquierda" style={btnStyle('left')}>
          <CaretLeft size={16} weight="bold" aria-hidden="true" />
        </button>
      )}
      {canRight && (
        <button onClick={() => scroll('right')} aria-label="Desplazar derecha" style={btnStyle('right')}>
          <CaretRight size={16} weight="bold" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  id, title, total, href,
}: {
  id: string; title: string; total: number; href: string
}) {
  return (
    <div
      className="reveal flex items-baseline justify-between mb-7 pb-3 border-b"
      style={{ borderColor: 'var(--color-text-primary)' }}
    >
      <h2
        id={id}
        style={{
          fontFamily: 'var(--font-family-display)',
          color: 'var(--color-text-primary)',
          fontSize: 'clamp(1.75rem, 2.5vw, 2.25rem)',
          letterSpacing: '-0.01em',
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        {title}
      </h2>
      <TransitionLink
        href={href}
        className="text-[11px] font-semibold uppercase flex-shrink-0 flex items-center gap-1 transition-opacity hover:opacity-70"
        style={{
          color: 'var(--color-crimson)',
          fontFamily: 'var(--font-family-body)',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.08em',
        }}
      >
        Ver todo ({total})
        <ArrowRight size={11} weight="bold" aria-hidden="true" />
      </TransitionLink>
    </div>
  )
}
