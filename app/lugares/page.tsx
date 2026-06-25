'use client'

import { useState, useMemo } from 'react'
import { MapPin, ArrowLeft } from '@phosphor-icons/react'
import { SearchBar } from '@/components/ui/SearchBar'
import { Card } from '@/components/ui/Card'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useFavorites } from '@/hooks/useFavorites'
import { useNearby, haversineKm } from '@/hooks/useNearby'
import { LUGARES } from '@/lib/data'
import { useFilters, TaxonomyChips, TaxonomyModal, applyTaxonomyFilters } from '@/components/ui/TaxonomyFilters'

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function LugaresPage() {
  const [query, setQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const { favorites, toggleFavorite } = useFavorites()
  const revealRef = useScrollReveal()
  const filters = useFilters()
  const { userCoords, nearbyMode, nearbyLoading, toggleNearby } = useNearby()

  const filtered = useMemo(() => {
    let matched = applyTaxonomyFilters(LUGARES, filters.state)
    if (query.trim()) {
      const q = norm(query.trim())
      matched = matched.filter(l => norm(`${l.title} ${l.location} ${l.category}`).includes(q))
    }
    if (nearbyMode && userCoords) {
      matched = [...matched].sort((a, b) => {
        if (a.lat === undefined || a.lng === undefined) return 1
        if (b.lat === undefined || b.lng === undefined) return -1
        return (
          haversineKm(userCoords.lat, userCoords.lng, a.lat, a.lng) -
          haversineKm(userCoords.lat, userCoords.lng, b.lat, b.lng)
        )
      })
    }
    return matched
  }, [query, filters.state, nearbyMode, userCoords])

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
              Lugares
            </h1>
          </div>
          <span className="text-sm font-medium pb-1" style={{ color: 'var(--color-text-muted)' }}>
            {filtered.length} de {LUGARES.length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="reveal px-5 sm:px-8 lg:px-12 pb-8" data-delay="50">
        <div className="mb-4">
          <SearchBar value={query} onChange={setQuery} placeholder="Buscar lugares..." />
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
          resultCount={filtered.length}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Grid */}
      <div className="px-5 sm:px-8 lg:px-12">
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center gap-4 py-20 rounded-2xl"
            style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
          >
            <MapPin size={32} weight="regular" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No hay lugares que coincidan
            </p>
            {filters.hasFilters && (
              <button
                onClick={filters.clearAll}
                className="px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ color: 'var(--color-crimson)', background: 'var(--color-crimson-light)' }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 360px))', gap: '24px' }}>
            {filtered.map((lugar, i) => (
              <Card
                key={lugar.id}
                {...lugar}
                revealDelay={i * 40}
                priority={i === 0}
                isFavorite={favorites.has(lugar.id)}
                onFavoriteToggle={() => toggleFavorite(lugar.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
