'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Path, ArrowLeft, BookmarkSimple } from '@phosphor-icons/react'
import Link from 'next/link'
import { SearchBar } from '@/components/ui/SearchBar'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { RUTAS, findLugar, findDestino } from '@/lib/data'
import { useFavorites } from '@/hooks/useFavorites'

const ALL_DESTINOS = ['Todos', ...Array.from(new Set(RUTAS.map(r => r.destinoId)))]
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function RutasPage() {
  const [query, setQuery] = useState('')
  const [activeDestino, setActiveDestino] = useState('Todos')
  const revealRef = useScrollReveal()
  const router = useRouter()
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
              return (
                <button
                  key={did}
                  onClick={() => setActiveDestino(did)}
                  aria-pressed={isActive}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200"
                  style={{
                    background: isActive ? 'var(--color-crimson)' : 'var(--color-surface)',
                    color: isActive ? 'white' : 'var(--color-text-muted)',
                    border: isActive ? 'none' : '1px solid var(--color-border)',
                  }}
                >
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {filtered.map(ruta => {
              const destino = findDestino(ruta.destinoId)
              const stops = ruta.stops.map(findLugar).filter(Boolean)
              return (
                <div
                  key={ruta.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/rutas/${ruta.id}`)}
                  onKeyDown={e => e.key === 'Enter' && router.push(`/rutas/${ruta.id}`)}
                  className="reveal rounded-2xl p-6 cursor-pointer transition-shadow hover:shadow-lg"
                  style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)', flex: '1 0 340px', maxWidth: '420px' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p
                        className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                        style={{ color: 'var(--color-crimson)', fontFamily: 'var(--font-family-heading)', letterSpacing: '0.1em' }}
                      >
                        {destino?.title ?? ruta.destinoId}
                      </p>
                      <h2
                        className="text-lg font-bold"
                        style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-display)' }}
                      >
                        {ruta.title}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={e => { e.stopPropagation(); toggleFavorite(ruta.id) }}
                        aria-label={favorites.has(ruta.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: favorites.has(ruta.id) ? 'var(--color-crimson)' : 'var(--color-text-muted)' }}
                      >
                        <BookmarkSimple size={18} weight={favorites.has(ruta.id) ? 'fill' : 'regular'} aria-hidden="true" />
                      </button>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'var(--color-crimson-light)' }}
                      >
                        <Path size={18} weight="regular" style={{ color: 'var(--color-crimson)' }} aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                    {ruta.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {[ruta.duration, ruta.distance, `${ruta.stops.length} paradas`].map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 rounded-lg font-medium"
                        style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    {stops.map((lugar, i) => lugar && (
                      <div key={lugar.id} className="flex items-center gap-2.5">
                        <div className="flex flex-col items-center">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                            style={{ background: 'var(--color-crimson)', fontFamily: 'var(--font-family-heading)' }}
                          >
                            {i + 1}
                          </div>
                          {i < stops.length - 1 && (
                            <div className="w-px h-3" style={{ background: 'var(--color-border)' }} />
                          )}
                        </div>
                        <Link
                          href={`/explorar/${lugar.id}`}
                          className="text-sm font-medium hover:underline"
                          style={{ color: 'var(--color-text-primary)' }}
                          onClick={e => e.stopPropagation()}
                        >
                          {lugar.title}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
