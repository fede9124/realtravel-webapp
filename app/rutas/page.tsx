'use client'

import { useState, useMemo } from 'react'
import { Path, ArrowLeft, MapPin, Globe } from '@phosphor-icons/react'
import { SearchBar } from '@/components/ui/SearchBar'
import { RouteCard } from '@/components/ui/RouteCard'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { RUTAS, findDestino } from '@/lib/data'
import { useFavorites } from '@/hooks/useFavorites'

const ALL_DESTINOS = ['Todos', ...Array.from(new Set(RUTAS.map(r => r.destinoId)))]
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function RutasPage() {
  const [query, setQuery] = useState('')
  const [activeDestino, setActiveDestino] = useState('Todos')
  const revealRef = useScrollReveal()
  const { favorites, toggleFavorite } = useFavorites()

  const filtered = useMemo(() => {
    return RUTAS.filter(r => {
      if (activeDestino !== 'Todos' && r.destinoId !== activeDestino) return false
      if (query.trim()) {
        const destino = findDestino(r.destinoId)
        const hay = norm(`${r.title} ${r.description} ${destino?.title ?? ''}`)
        if (!hay.includes(norm(query.trim()))) return false
      }
      return true
    })
  }, [query, activeDestino])

  return (
    <div ref={revealRef} className="w-full pb-24">
      <div className="reveal px-5 sm:px-8 lg:px-12 pt-14 pb-6">
        <TransitionLink
          href="/explorar"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ArrowLeft size={15} weight="regular" aria-hidden="true" />
          Explorar
        </TransitionLink>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p
              className="text-xs font-bold uppercase mb-2"
              style={{ color: 'var(--color-crimson)', letterSpacing: '0.12em', fontFamily: 'var(--font-family-heading)' }}
            >
              Catálogo
            </p>
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
              Rutas
            </h1>
          </div>
          <span className="text-sm font-medium pb-1" style={{ color: 'var(--color-text-muted)' }}>
            {filtered.length} de {RUTAS.length}
          </span>
        </div>
      </div>

      {/* Destino filters + search */}
      <div className="reveal px-5 sm:px-8 lg:px-12 pb-8" data-delay="50">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 overflow-x-auto scroll-hide flex-1">
            {ALL_DESTINOS.map(did => {
              const isActive = activeDestino === did
              const label = did === 'Todos' ? 'Todos' : (findDestino(did)?.title ?? did)
              const DestIcon = did === 'Todos' ? Globe : MapPin
              return (
                <button
                  key={did}
                  onClick={() => setActiveDestino(did)}
                  aria-pressed={isActive}
                  className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-200"
                  style={{
                    background: isActive ? 'var(--color-crimson)' : 'var(--color-surface)',
                    color: isActive ? 'white' : 'var(--color-text-muted)',
                    border: isActive ? 'none' : '1px solid var(--color-border)',
                  }}
                >
                  <DestIcon size={11} aria-hidden="true" />
                  {label}
                </button>
              )
            })}
          </div>
          <div className="sm:w-64">
            <SearchBar value={query} onChange={setQuery} placeholder="Buscar rutas..." />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-5 sm:px-8 lg:px-12">
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center gap-4 py-20 rounded-2xl"
            style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
          >
            <Path size={32} weight="regular" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No hay rutas que coincidan
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 360px))', gap: '24px' }}>
            {filtered.map((ruta, i) => {
              const destino = findDestino(ruta.destinoId)
              return (
                <RouteCard
                  key={ruta.id}
                  {...ruta}
                  destinoTitle={destino?.title}
                  revealDelay={i * 30}
                  priority={i === 0}
                  isFavorite={favorites.has(ruta.id)}
                  onFavoriteToggle={() => toggleFavorite(ruta.id)}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
