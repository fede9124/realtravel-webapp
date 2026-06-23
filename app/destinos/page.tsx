'use client'

import { useState, useMemo } from 'react'
import { Globe } from '@phosphor-icons/react'
import { SearchBar } from '@/components/ui/SearchBar'
import { Card } from '@/components/ui/Card'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useFavorites } from '@/hooks/useFavorites'
import { DESTINOS } from '@/lib/data'
import { ArrowLeft } from '@phosphor-icons/react'

const ALL_MOODS = ['Todos', 'aventura', 'historia', 'cultura', 'relajo', 'gastronomia', 'naturaleza', 'moderno']
const MOOD_LABELS: Record<string, string> = {
  todos: 'Todos', aventura: 'Aventura', historia: 'Historia', cultura: 'Cultura',
  relajo: 'Relajo', gastronomia: 'Gastronomía', naturaleza: 'Naturaleza', moderno: 'Moderno',
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function DestinosPage() {
  const [query, setQuery] = useState('')
  const [activeMood, setActiveMood] = useState('Todos')
  const { favorites, toggleFavorite } = useFavorites()
  const revealRef = useScrollReveal()

  const filtered = useMemo(() => {
    return DESTINOS.filter(d => {
      if (activeMood !== 'Todos' && !d.moods.includes(activeMood)) return false
      if (query.trim()) {
        const hay = norm(`${d.title} ${d.location} ${d.country}`)
        if (!hay.includes(norm(query.trim()))) return false
      }
      return true
    })
  }, [query, activeMood])

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

      {/* Mood filters */}
      <div className="reveal px-5 sm:px-8 lg:px-12 pb-8" data-delay="50">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 overflow-x-auto scroll-hide flex-1">
            {ALL_MOODS.map(mood => {
              const key = mood.toLowerCase()
              const isActive = activeMood === mood
              return (
                <button
                  key={mood}
                  onClick={() => setActiveMood(mood)}
                  aria-pressed={isActive}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200"
                  style={{
                    background: isActive ? 'var(--color-crimson)' : 'var(--color-surface)',
                    color: isActive ? 'white' : 'var(--color-text-muted)',
                    border: isActive ? 'none' : '1px solid var(--color-border)',
                  }}
                >
                  {MOOD_LABELS[key] ?? mood}
                </button>
              )
            })}
          </div>
          <div className="sm:w-64">
            <SearchBar value={query} onChange={setQuery} placeholder="Buscar destinos..." />
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
            <Globe size={32} weight="regular" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No hay destinos que coincidan
            </p>
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
