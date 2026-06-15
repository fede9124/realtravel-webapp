'use client'

import { useState, useMemo } from 'react'
import { MapPin, ArrowLeft, SlidersHorizontal, X } from '@phosphor-icons/react'
import { SearchBar } from '@/components/ui/SearchBar'
import { Card } from '@/components/ui/Card'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useFavorites } from '@/hooks/useFavorites'
import { LUGARES } from '@/lib/data'

const ALL_CATEGORIES = ['Todos', ...Array.from(new Set(LUGARES.map(l => l.category))).sort()]

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function LugaresPage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [showFiltersPopup, setShowFiltersPopup] = useState(false)
  const { favorites, toggleFavorite } = useFavorites()
  const revealRef = useScrollReveal()

  const filtered = useMemo(() => {
    return LUGARES.filter(l => {
      if (activeCategory !== 'Todos' && l.category !== activeCategory) return false
      if (query.trim()) {
        const hay = norm(`${l.title} ${l.location} ${l.category}`)
        if (!hay.includes(norm(query.trim()))) return false
      }
      return true
    })
  }, [query, activeCategory])

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
        {/* Row 1: search + filter button */}
        <div className="flex gap-3 items-center mb-3">
          <div className="flex-1">
            <SearchBar value={query} onChange={setQuery} placeholder="Buscar lugares..." />
          </div>
          <button
            onClick={() => setShowFiltersPopup(true)}
            aria-label="Abrir filtros de categoría"
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
            style={{
              background: activeCategory !== 'Todos' ? 'var(--color-crimson)' : 'var(--color-surface)',
              color: activeCategory !== 'Todos' ? 'white' : 'var(--color-text-muted)',
              border: activeCategory !== 'Todos' ? 'none' : '1px solid var(--color-border)',
            }}
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
            Filtros
            {activeCategory !== 'Todos' && (
              <span
                className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.25)' }}
              >
                1
              </span>
            )}
          </button>
        </div>

        {/* Row 2: quick chip strip — scrollable */}
        <div className="flex gap-2 overflow-x-auto scroll-hide">
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              aria-pressed={activeCategory === cat}
              className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200"
              style={{
                background: activeCategory === cat ? 'var(--color-crimson)' : 'var(--color-surface)',
                color: activeCategory === cat ? 'white' : 'var(--color-text-muted)',
                border: activeCategory === cat ? 'none' : '1px solid var(--color-border)',
              }}
            >
              {cat === 'Todos' && <MapPin size={11} aria-hidden="true" />}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Filters popup */}
      {showFiltersPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowFiltersPopup(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: 'var(--color-card)', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-base" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-heading)' }}>
                Filtrar por categoría
              </h2>
              <button
                onClick={() => setShowFiltersPopup(false)}
                aria-label="Cerrar filtros"
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface)' }}
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_CATEGORIES.map(cat => {
                const isActive = activeCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setShowFiltersPopup(false) }}
                    aria-pressed={isActive}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-left cursor-pointer transition-all duration-150"
                    style={{
                      background: isActive ? 'var(--color-crimson)' : 'var(--color-surface)',
                      color: isActive ? 'white' : 'var(--color-text-muted)',
                      border: isActive ? 'none' : '1px solid var(--color-border)',
                    }}
                  >
                    {cat === 'Todos' && <MapPin size={13} aria-hidden="true" />}
                    {cat}
                  </button>
                )
              })}
            </div>
            {activeCategory !== 'Todos' && (
              <button
                onClick={() => { setActiveCategory('Todos'); setShowFiltersPopup(false) }}
                className="mt-4 w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ color: 'var(--color-crimson)', background: 'var(--color-crimson-light)' }}
              >
                Limpiar filtro
              </button>
            )}
          </div>
        </div>
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
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
            {filtered.map((lugar, i) => (
              <Card
                key={lugar.id}
                {...lugar}
                revealDelay={i * 40}
                isFavorite={favorites.has(lugar.id)}
                onFavoriteToggle={() => toggleFavorite(lugar.id)}
                style={{ flex: '1 0 280px', maxWidth: '360px' }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
