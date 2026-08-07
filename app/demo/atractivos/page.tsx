'use client'

import { useState, useMemo } from 'react'
import { MapPin, ArrowLeft } from '@phosphor-icons/react'
import { SearchBar } from '@/components/ui/SearchBar'
import { Card } from '@/components/ui/Card'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { LUGARES } from '@/lib/data'

const PV_LUGARES = LUGARES.filter(l => l.destinoId === 'puerto-varas')
const CATEGORIES = ['Todos', ...new Set(PV_LUGARES.map(l => l.category))]

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function DemoAtractivosPage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const revealRef = useScrollReveal()

  const filtered = useMemo(() => {
    let list = activeCategory === 'Todos'
      ? PV_LUGARES
      : PV_LUGARES.filter(l => l.category === activeCategory)
    if (query.trim()) {
      const q = norm(query.trim())
      list = list.filter(l => norm(`${l.title} ${l.location} ${l.category}`).includes(q))
    }
    return list
  }, [query, activeCategory])

  const hasFilters = query.trim() !== '' || activeCategory !== 'Todos'

  const clearAll = () => {
    setQuery('')
    setActiveCategory('Todos')
  }

  return (
    <div ref={revealRef} className="w-full pb-24">
      <div className="reveal px-5 sm:px-8 lg:px-12 pt-14 pb-6">
        <TransitionLink
          href="/demo"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <ArrowLeft size={15} weight="regular" aria-hidden="true" />
          Inicio
        </TransitionLink>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p
              className="text-xs font-bold uppercase mb-2"
              style={{ color: 'var(--color-crimson)', letterSpacing: '0.12em', fontFamily: 'var(--font-family-heading)' }}
            >
              Puerto Varas
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
              Atractivos
            </h1>
          </div>
          <span className="text-sm font-medium pb-1" style={{ color: 'var(--color-text-muted)' }}>
            {filtered.length} de {PV_LUGARES.length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="reveal px-5 sm:px-8 lg:px-12 pb-8" data-delay="50">
        <div className="mb-4">
          <SearchBar value={query} onChange={setQuery} placeholder="Buscar atractivos..." />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-150"
              style={{
                fontFamily: 'var(--font-family-body)',
                background: activeCategory === cat ? 'var(--color-crimson)' : 'var(--color-card)',
                color: activeCategory === cat ? 'white' : 'var(--color-text-muted)',
                border: `1px solid ${activeCategory === cat ? 'var(--color-crimson)' : 'var(--color-border)'}`,
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-5 sm:px-8 lg:px-12">
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center gap-4 py-20 rounded-2xl"
            style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
          >
            <MapPin size={32} weight="regular" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No hay atractivos que coincidan
            </p>
            {hasFilters && (
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
            {filtered.map((lugar, i) => (
              <Card
                key={lugar.id}
                {...lugar}
                href={`/demo/atractivos/${lugar.id}`}
                revealDelay={i * 40}
                priority={i === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
