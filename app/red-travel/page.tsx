'use client'

import { useState, useMemo } from 'react'
import { Tag, ForkKnife, ShoppingBag, PaintBrush, AirplaneTakeoff, Storefront } from '@phosphor-icons/react'
import { SearchBar } from '@/components/ui/SearchBar'
import { ChipFilter } from '@/components/ui/ChipFilter'
import { Card } from '@/components/ui/Card'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { COMERCIOS } from '@/lib/data'

const FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'beneficios', label: 'Con descuento', Icon: Tag },
  { id: 'gastronomia', label: 'Gastronomía', Icon: ForkKnife },
  { id: 'tiendas', label: 'Tiendas', Icon: ShoppingBag },
  { id: 'artesania', label: 'Artesanía', Icon: PaintBrush },
  { id: 'aeropuertos', label: 'Aeropuertos', Icon: AirplaneTakeoff },
]

// Búsqueda insensible a acentos y mayúsculas
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export default function RedTravelPage() {
  const [activeFilter, setActiveFilter] = useState('todos')
  const [query, setQuery] = useState('')
  const revealRef = useScrollReveal()

  const filtered = useMemo(() => {
    let result =
      activeFilter === 'todos'
        ? COMERCIOS
        : activeFilter === 'beneficios'
        ? COMERCIOS.filter(c => !!c.badge)
        : COMERCIOS.filter(c => c.category.toLowerCase() === activeFilter)

    if (query.trim() !== '') {
      const q = norm(query.trim())
      result = result.filter(c => norm(`${c.title} ${c.location} ${c.category}`).includes(q))
    }
    return result
  }, [activeFilter, query])

  const withDiscount = filtered.filter(c => c.badge)
  // Exclude badged items from the main grid when 'todos' is active — they're already shown above
  const mainFiltered = activeFilter === 'todos' ? filtered.filter(c => !c.badge) : filtered
  const hasActiveFilters = query.trim() !== '' || activeFilter !== 'todos'

  const clearFilters = () => {
    setQuery('')
    setActiveFilter('todos')
  }

  return (
    <div ref={revealRef} className="px-5 sm:px-8 lg:px-12 pt-14 pb-24 w-full">
      <div className="reveal mb-3">
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
          Red Travel
        </h1>
      </div>

      <div className="reveal flex flex-col gap-4 mb-12" data-delay="80">
        <div className="max-w-xl">
          <SearchBar value={query} onChange={setQuery} placeholder="Buscar comercios, restaurantes, beneficios..." />
        </div>
        <ChipFilter chips={FILTERS} activeId={activeFilter} onChange={setActiveFilter} />
      </div>

      {/* ── Sin resultados ── */}
      {filtered.length === 0 && (
        <div
          className="flex flex-col items-center justify-center gap-6 px-6 py-20 rounded-2xl"
          style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
          role="status"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--color-crimson-light)' }}
          >
            <Storefront size={30} weight="regular" style={{ color: 'var(--color-crimson)' }} aria-hidden="true" />
          </div>
          <div className="text-center max-w-sm">
            <h2 className="font-bold text-lg mb-1.5" style={{ color: 'var(--color-text-primary)' }}>
              Sin resultados
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {query.trim() !== ''
                ? `No encontramos comercios para "${query.trim()}".`
                : 'Ningún comercio coincide con el filtro seleccionado.'}
            </p>
          </div>
          <button
            onClick={clearFilters}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'var(--color-crimson)' }}
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {activeFilter === 'todos' && withDiscount.length > 0 && (
        <section aria-labelledby="heading-destacados" className="mb-16">
          <div
            className="reveal flex items-baseline justify-between mb-7 pb-3 border-b"
            style={{ borderColor: 'var(--color-text-primary)' }}
          >
            <h2
              id="heading-destacados"
              style={{
                fontFamily: 'var(--font-family-display)',
                color: 'var(--color-text-primary)',
                fontSize: 'clamp(1.75rem, 2.5vw, 2.25rem)',
                letterSpacing: '-0.01em',
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              Con descuento
            </h2>
            <span
              className="text-[11px] font-semibold uppercase flex-shrink-0"
              style={{ color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.08em' }}
            >
              {withDiscount.length} con beneficio
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
            {withDiscount.map((c, i) => (
              <Card key={c.id} {...c} revealDelay={i * 60} href={`/red-travel/${c.id}`} style={{ flex: '1 0 280px', maxWidth: '360px' }} />
            ))}
          </div>
        </section>
      )}

      {mainFiltered.length > 0 && (
      <section aria-labelledby="heading-comercios">
        <div
          className="reveal flex items-baseline justify-between mb-7 pb-3 border-b"
          style={{ borderColor: 'var(--color-text-primary)' }}
        >
          <h2
            id="heading-comercios"
            style={{
              fontFamily: 'var(--font-family-display)',
              color: 'var(--color-text-primary)',
              fontSize: 'clamp(1.75rem, 2.5vw, 2.25rem)',
              letterSpacing: '-0.01em',
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            {activeFilter === 'todos'
              ? 'Todos los comercios'
              : FILTERS.find(f => f.id === activeFilter)?.label ?? ''}
          </h2>
          <span
            className="text-[11px] font-semibold uppercase flex-shrink-0"
            style={{ color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.08em' }}
          >
            {hasActiveFilters
              ? `${mainFiltered.length} ${mainFiltered.length === 1 ? 'resultado' : 'resultados'}`
              : `${mainFiltered.length} en total`}
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          {mainFiltered.map((c, i) => (
            <Card key={c.id} {...c} revealDelay={i * 60} priority={i === 0} href={`/red-travel/${c.id}`} style={{ flex: '1 0 280px', maxWidth: '360px' }} />
          ))}
        </div>
      </section>
      )}
    </div>
  )
}
