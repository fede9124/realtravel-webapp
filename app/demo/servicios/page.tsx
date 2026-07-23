'use client'

import { useState, useMemo } from 'react'
import { SearchBar } from '@/components/ui/SearchBar'
import { Card } from '@/components/ui/Card'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { COMERCIOS } from '@/lib/data'

const PV_COMERCIOS = COMERCIOS.filter(c => c.destinoId === 'puerto-varas')
const CATEGORIES = ['Todos', ...new Set(PV_COMERCIOS.map(c => c.category))]

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function DemoServiciosPage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Todos')
  const revealRef = useScrollReveal()

  const filtered = useMemo(() => {
    let list = activeCategory === 'Todos'
      ? PV_COMERCIOS
      : PV_COMERCIOS.filter(c => c.category === activeCategory)
    if (query.trim()) {
      const q = norm(query.trim())
      list = list.filter(c => norm(`${c.title} ${c.location} ${c.category} ${c.description}`).includes(q))
    }
    return list
  }, [query, activeCategory])

  return (
    <div ref={revealRef} className="w-full pb-24">
      <div className="reveal px-5 sm:px-8 lg:px-12 pt-10 pb-6">
        <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-crimson)', letterSpacing: '0.1em', fontFamily: 'var(--font-family-body)' }}>
          Puerto Varas
        </p>
        <h1 className="font-bold mb-2" style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(24px, 4vw, 40px)', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Servicios turísticos
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          {filtered.length} de {PV_COMERCIOS.length}
        </p>

        <SearchBar value={query} onChange={setQuery} placeholder="Buscar servicios…" />
      </div>

      <div className="reveal px-5 sm:px-8 lg:px-12 pb-6">
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

      <div className="reveal px-5 sm:px-8 lg:px-12">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No se encontraron servicios con esos filtros.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 360px))', gap: '32px 24px' }}>
            {filtered.map((c, i) => (
              <Card
                key={c.id}
                id={c.id}
                image={c.image}
                category={c.category}
                title={c.title}
                location={c.location}
                rating={c.rating}
                badge={c.badge}
                href={`/demo/servicios/${c.id}`}
                revealDelay={i * 40}
                priority={i < 4}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
