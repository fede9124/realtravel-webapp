'use client'

import { useState, useMemo } from 'react'
import { Path, ArrowLeft } from '@phosphor-icons/react'
import { SearchBar } from '@/components/ui/SearchBar'
import { RouteCard } from '@/components/ui/RouteCard'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { RUTAS, routeCreatorComercio } from '@/lib/data'
import { SingleChip } from '@/components/ui/TaxonomyFilters'

const PV_RUTAS = RUTAS.filter(r => r.destinoId === 'puerto-varas')
const DIFICULTADES = ['Fácil', 'Moderada', 'Desafiante'] as const

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function DemoRutasPage() {
  const [query, setQuery] = useState('')
  const [dificultad, setDificultad] = useState<string | null>(null)
  const revealRef = useScrollReveal()

  const filtered = useMemo(() => {
    return PV_RUTAS.filter(r => {
      if (dificultad && r.difficulty !== dificultad) return false
      if (query.trim()) {
        if (!norm(`${r.title} ${r.description}`).includes(norm(query.trim()))) return false
      }
      return true
    })
  }, [query, dificultad])

  const activeCount = dificultad ? 1 : 0
  const clearAll = () => { setDificultad(null); setQuery('') }

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
              Rutas
            </h1>
          </div>
          <span className="text-sm font-medium pb-1" style={{ color: 'var(--color-text-muted)' }}>
            {filtered.length} de {PV_RUTAS.length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="reveal px-5 sm:px-8 lg:px-12 pb-8" data-delay="50">
        <div className="mb-4">
          <SearchBar value={query} onChange={setQuery} placeholder="Buscar rutas..." />
        </div>
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
              const creator = routeCreatorComercio(ruta.id)
              return (
                <RouteCard
                  key={ruta.id}
                  {...ruta}
                  href={`/demo/rutas/${ruta.id}`}
                  destinoTitle="Puerto Varas"
                  createdBy={creator?.title ?? 'Puerto Varas'}
                  createdByHref={creator ? `/demo/servicios/${creator.id}` : undefined}
                  revealDelay={i * 30}
                  priority={i === 0}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
