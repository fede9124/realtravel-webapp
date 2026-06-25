'use client'

import { useState, useMemo } from 'react'
import {
  Globe, ArrowLeft, Mountains, Bank, Waves, ForkKnife, Palette, Tent, Buildings, type Icon,
} from '@phosphor-icons/react'
import { SearchBar } from '@/components/ui/SearchBar'
import { Card } from '@/components/ui/Card'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useFavorites } from '@/hooks/useFavorites'
import { DESTINOS } from '@/lib/data'
import { SingleChip, FilterGroup, FiltrosButton, FilterModal } from '@/components/ui/TaxonomyFilters'

const MOODS = ['aventura', 'historia', 'cultura', 'relajo', 'gastronomia', 'naturaleza', 'moderno']
const MOOD_LABELS: Record<string, string> = {
  aventura: 'Aventura', historia: 'Historia', cultura: 'Cultura',
  relajo: 'Relajo', gastronomia: 'Gastronomía', naturaleza: 'Naturaleza', moderno: 'Moderno',
}
const MOOD_ICONS: Record<string, Icon> = {
  aventura: Mountains, historia: Bank, cultura: Palette,
  relajo: Waves, gastronomia: ForkKnife, naturaleza: Tent, moderno: Buildings,
}

const PAISES = [...new Set(DESTINOS.map(d => d.country))].sort((a, b) => a.localeCompare(b))

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function DestinosPage() {
  const [query, setQuery] = useState('')
  const [mood, setMood] = useState<string | null>(null)
  const [pais, setPais] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const { favorites, toggleFavorite } = useFavorites()
  const revealRef = useScrollReveal()

  const activeCount = (mood ? 1 : 0) + (pais ? 1 : 0)

  const filtered = useMemo(() => {
    return DESTINOS.filter(d => {
      if (mood && !d.moods.includes(mood)) return false
      if (pais && d.country !== pais) return false
      if (query.trim()) {
        const hay = norm(`${d.title} ${d.location} ${d.country}`)
        if (!hay.includes(norm(query.trim()))) return false
      }
      return true
    })
  }, [query, mood, pais])

  const clearAll = () => { setMood(null); setPais(null) }

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
              Destinos
            </h1>
          </div>
          <span className="text-sm font-medium pb-1" style={{ color: 'var(--color-text-muted)' }}>
            {filtered.length} de {DESTINOS.length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="reveal px-5 sm:px-8 lg:px-12 pb-8" data-delay="50">
        <div className="mb-4">
          <SearchBar value={query} onChange={setQuery} placeholder="Buscar destinos..." />
        </div>
        <div className="flex flex-col gap-2.5">
          {/* Primary row: filter button */}
          <div className="flex items-center gap-2 flex-wrap">
            <FiltrosButton activeCount={activeCount} onClick={() => setShowModal(true)} />
          </div>

          {/* Mood row */}
          <div className="flex gap-1.5 overflow-x-auto scroll-hide">
            {MOODS.map(m => {
              const MoodIcon = MOOD_ICONS[m]
              return (
                <button
                  key={m}
                  onClick={() => setMood(mood === m ? null : m)}
                  aria-pressed={mood === m}
                  className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 active:scale-95"
                  style={{
                    background: mood === m ? 'var(--color-crimson)' : 'var(--color-surface)',
                    color: mood === m ? 'white' : 'var(--color-text-muted)',
                    border: mood === m ? 'none' : '1px solid var(--color-border)',
                  }}
                >
                  {MoodIcon && <MoodIcon size={11} aria-hidden="true" />}
                  {MOOD_LABELS[m]}
                </button>
              )
            })}
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
          <FilterGroup title="Mood">
            {MOODS.map(m => (
              <SingleChip
                key={m}
                label={MOOD_LABELS[m]}
                active={mood === m}
                onClick={() => setMood(mood === m ? null : m)}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="País">
            {PAISES.map(p => (
              <SingleChip
                key={p}
                label={p}
                active={pais === p}
                onClick={() => setPais(pais === p ? null : p)}
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
            <Globe size={32} weight="regular" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No hay destinos que coincidan
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
            {filtered.map((destino, i) => (
              <Card
                key={destino.id}
                {...destino}
                href={`/destinos/${destino.id}`}
                revealDelay={i * 40}
                priority={i === 0}
                isFavorite={favorites.has(destino.id)}
                onFavoriteToggle={() => toggleFavorite(destino.id)}
                style={{ flex: '1 0 280px', maxWidth: '360px' }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
