'use client'

import { useState, useMemo } from 'react'
import { Path, ArrowLeft } from '@phosphor-icons/react'
import { SearchBar } from '@/components/ui/SearchBar'
import { RouteCard } from '@/components/ui/RouteCard'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { RUTAS, findDestino, routeCreatorComercio } from '@/lib/data'
import { useFavorites } from '@/hooks/useFavorites'
import { SingleChip, FilterGroup, FiltrosButton, FilterModal, DropdownFilter } from '@/components/ui/TaxonomyFilters'

const DIFICULTADES = ['Fácil', 'Moderada', 'Desafiante'] as const

const DESTINO_OPTIONS = [...new Set(RUTAS.map(r => r.destinoId))]
  .map(id => ({ value: id, label: findDestino(id)?.title ?? id }))
  .sort((a, b) => a.label.localeCompare(b.label))

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function RutasPage() {
  const [query, setQuery] = useState('')
  const [destinoId, setDestinoId] = useState<string | null>(null)
  const [dificultad, setDificultad] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const revealRef = useScrollReveal()
  const { favorites, toggleFavorite } = useFavorites()

  const activeCount = (destinoId ? 1 : 0) + (dificultad ? 1 : 0)

  const filtered = useMemo(() => {
    return RUTAS.filter(r => {
      if (destinoId && r.destinoId !== destinoId) return false
      if (dificultad && r.difficulty !== dificultad) return false
      if (query.trim()) {
        const destino = findDestino(r.destinoId)
        const hay = norm(`${r.title} ${r.description} ${destino?.title ?? ''}`)
        if (!hay.includes(norm(query.trim()))) return false
      }
      return true
    })
  }, [query, destinoId, dificultad])

  const clearAll = () => { setDestinoId(null); setDificultad(null) }

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

      {/* Filters */}
      <div className="reveal px-5 sm:px-8 lg:px-12 pb-8" data-delay="50">
        <div className="mb-4">
          <SearchBar value={query} onChange={setQuery} placeholder="Buscar rutas..." />
        </div>
        <div className="flex flex-col gap-2.5">
          {/* Primary row: destino dropdown + filter button */}
          <div className="flex items-center gap-2 flex-wrap">
            <DropdownFilter label="Destino" value={destinoId} options={DESTINO_OPTIONS} onSelect={setDestinoId} />
            <FiltrosButton activeCount={activeCount} onClick={() => setShowModal(true)} />
          </div>

          {/* Dificultad row */}
          <div className="flex gap-1.5 overflow-x-auto scroll-hide">
            {DIFICULTADES.map(d => (
              <SingleChip
                key={d}
                label={d}
                active={dificultad === d}
                onClick={() => setDificultad(dificultad === d ? null : d)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Filter modal */}
      {showModal && (
        <FilterModal
          activeCount={activeCount}
          resultCount={filtered.length}
          onClose={() => setShowModal(false)}
          onClear={clearAll}
        >
          <FilterGroup title="Destino">
            {DESTINO_OPTIONS.map(opt => (
              <SingleChip
                key={opt.value}
                label={opt.label}
                active={destinoId === opt.value}
                onClick={() => setDestinoId(destinoId === opt.value ? null : opt.value)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Dificultad">
            {DIFICULTADES.map(d => (
              <SingleChip
                key={d}
                label={d}
                active={dificultad === d}
                onClick={() => setDificultad(dificultad === d ? null : d)}
              />
            ))}
          </FilterGroup>
        </FilterModal>
      )}

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
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ color: 'var(--color-crimson)', background: 'var(--color-crimson-light)' }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 360px))', gap: '24px' }}>
            {filtered.map((ruta, i) => {
              const destino = findDestino(ruta.destinoId)
              const creator = routeCreatorComercio(ruta.id)
              return (
                <RouteCard
                  key={ruta.id}
                  {...ruta}
                  destinoTitle={destino?.title}
                  createdBy={creator?.title ?? 'Real Travel'}
                  createdByHref={creator ? `/red-travel/${creator.id}` : undefined}
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
