'use client'

import { useState, useMemo } from 'react'
import { RouteCard } from '@/components/ui/RouteCard'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { RUTAS, routeCreatorComercio } from '@/lib/data'

const PV_RUTAS = RUTAS.filter(r => r.destinoId === 'puerto-varas')
const DIFICULTADES = ['Fácil', 'Moderada', 'Desafiante'] as const

export default function DemoRutasPage() {
  const [dificultad, setDificultad] = useState<string | null>(null)
  const revealRef = useScrollReveal()

  const filtered = useMemo(() => {
    if (!dificultad) return PV_RUTAS
    return PV_RUTAS.filter(r => r.difficulty === dificultad)
  }, [dificultad])

  return (
    <div ref={revealRef} className="w-full pb-24">
      <div className="reveal px-5 sm:px-8 lg:px-12 pt-10 pb-6">
        <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-crimson)', letterSpacing: '0.1em', fontFamily: 'var(--font-family-body)' }}>
          Puerto Varas
        </p>
        <h1 className="font-bold mb-2" style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(24px, 4vw, 40px)', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Rutas temáticas
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          {filtered.length} ruta{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="reveal px-5 sm:px-8 lg:px-12 pb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDificultad(null)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-150"
            style={{
              fontFamily: 'var(--font-family-body)',
              background: !dificultad ? 'var(--color-crimson)' : 'var(--color-card)',
              color: !dificultad ? 'white' : 'var(--color-text-muted)',
              border: `1px solid ${!dificultad ? 'var(--color-crimson)' : 'var(--color-border)'}`,
              cursor: 'pointer',
            }}
          >
            Todas
          </button>
          {DIFICULTADES.map(d => (
            <button
              key={d}
              onClick={() => setDificultad(dificultad === d ? null : d)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-150"
              style={{
                fontFamily: 'var(--font-family-body)',
                background: dificultad === d ? 'var(--color-crimson)' : 'var(--color-card)',
                color: dificultad === d ? 'white' : 'var(--color-text-muted)',
                border: `1px solid ${dificultad === d ? 'var(--color-crimson)' : 'var(--color-border)'}`,
                cursor: 'pointer',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="reveal px-5 sm:px-8 lg:px-12">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No hay rutas con esa dificultad.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 420px))', gap: '24px' }}>
            {filtered.map(r => {
              const creator = routeCreatorComercio(r.id)
              return (
                <RouteCard
                  key={r.id}
                  {...r}
                  href={`/demo/rutas/${r.id}`}
                  createdBy={creator?.title ?? 'Puerto Varas'}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
