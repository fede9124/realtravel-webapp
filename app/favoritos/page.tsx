'use client'

import { useState } from 'react'
import { BookmarkSimple } from '@phosphor-icons/react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { useFavorites } from '@/hooks/useFavorites'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { findAny, hrefFor, type Lugar, type Destino, type Comercio } from '@/lib/data'

const TABS = [
  { id: 'lugares', label: 'Lugares', kind: 'lugar' },
  { id: 'destinos', label: 'Destinos', kind: 'destino' },
  { id: 'comercios', label: 'Comercios', kind: 'comercio' },
  { id: 'rutas', label: 'Rutas', kind: 'ruta' },
] as const

export default function FavoritosPage() {
  const [activeTab, setActiveTab] = useState<string>('lugares')
  const { favorites, toggleFavorite } = useFavorites()
  const revealRef = useScrollReveal()

  // Resuelve los ids guardados contra el catálogo y agrupa por tipo
  const savedItems = [...favorites]
    .map(findAny)
    .filter((item): item is Lugar | Destino | Comercio => item !== undefined)

  const itemsFor = (kind: string) => savedItems.filter(item => item.kind === kind)

  return (
    <div ref={revealRef} className="px-5 sm:px-8 lg:px-12 pt-14 pb-24 w-full">
      <div className="mb-6">
        <h1
          style={{
            fontFamily: 'var(--font-family-display)',
            color: 'var(--color-text-primary)',
            fontSize: 'clamp(3.5rem, 6vw, 6.5rem)',
            letterSpacing: '-0.02em',
            lineHeight: 0.95,
            fontWeight: 600,
          }}
        >
          Favoritos
        </h1>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 border-b mb-10"
        style={{ borderColor: 'var(--color-border)' }}
        role="tablist"
        aria-label="Categorías de favoritos"
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          const count = tab.kind === 'ruta' ? 0 : itemsFor(tab.kind).length
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className="relative px-5 py-3 text-sm font-medium transition-colors"
              style={{ color: isActive ? 'var(--color-crimson)' : 'var(--color-text-muted)' }}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className="ml-1.5 text-xs font-semibold"
                  style={{ fontVariantNumeric: 'tabular-nums', opacity: 0.7 }}
                >
                  {count}
                </span>
              )}
              {isActive && (
                <span
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                  style={{ background: 'var(--color-crimson)' }}
                />
              )}
            </button>
          )
        })}
      </div>

      {TABS.map(tab => {
        const items = tab.kind === 'ruta' ? [] : itemsFor(tab.kind)
        return (
          <div
            key={tab.id}
            id={`tabpanel-${tab.id}`}
            role="tabpanel"
            aria-label={`${tab.label} guardados`}
            hidden={activeTab !== tab.id}
          >
            {items.length === 0 ? (
              <EmptyState label={tab.label} />
            ) : (
              <div className="grid gap-x-6 gap-y-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))' }}>
                {items.map((item, i) => (
                  <Card
                    key={item.id}
                    {...item}
                    href={hrefFor(item)}
                    revealDelay={i * 60}
                    isFavorite={favorites.has(item.id)}
                    onFavoriteToggle={() => toggleFavorite(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-6 px-6 py-24 rounded-2xl"
      style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--color-crimson-light)' }}
      >
        <BookmarkSimple size={36} weight="regular" style={{ color: 'var(--color-crimson)' }} aria-hidden="true" />
      </div>
      <div className="text-center max-w-sm">
        <h2 className="font-bold text-xl mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Sin {label.toLowerCase()} guardados
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          Explora destinos increíbles y guárdalos aquí para acceder sin conexión a internet cuando viajes.
        </p>
      </div>
      <Link
        href="/explorar"
        className="px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
        style={{ background: 'var(--color-crimson)' }}
      >
        Explorar ahora
      </Link>
    </div>
  )
}
