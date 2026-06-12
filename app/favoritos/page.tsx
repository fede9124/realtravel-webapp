'use client'

import { useState } from 'react'
import { BookmarkSimple, Path, MapPin } from '@phosphor-icons/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { useFavorites } from '@/hooks/useFavorites'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { findAny, hrefFor, RUTAS, findLugar, findDestino as findDest, type Lugar, type Destino, type Comercio } from '@/lib/data'

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
            fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
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
          const count = tab.kind === 'ruta' ? RUTAS.length : itemsFor(tab.kind).length
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
        if (tab.kind === 'ruta') {
          return (
            <div
              key={tab.id}
              id={`tabpanel-${tab.id}`}
              role="tabpanel"
              aria-label="Rutas sugeridas"
              hidden={activeTab !== tab.id}
            >
              <RutasList />
            </div>
          )
        }
        const items = itemsFor(tab.kind)
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

function RutasList() {
  const router = useRouter()
  return (
    <div className="flex flex-col gap-5">
      {RUTAS.map(ruta => {
        const destino = findDest(ruta.destinoId)
        const stops = ruta.stops.map(findLugar).filter(Boolean)
        return (
          <div
            key={ruta.id}
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/rutas/${ruta.id}`)}
            onKeyDown={e => e.key === 'Enter' && router.push(`/rutas/${ruta.id}`)}
            className="reveal rounded-2xl p-6 cursor-pointer transition-shadow hover:shadow-lg"
            style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                  style={{ color: 'var(--color-crimson)', fontFamily: 'var(--font-family-heading)', letterSpacing: '0.1em' }}
                >
                  {destino?.title ?? ruta.destinoId}
                </p>
                <h3
                  className="text-lg font-bold"
                  style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-display)' }}
                >
                  {ruta.title}
                </h3>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--color-crimson-light)' }}
              >
                <Path size={18} weight="regular" style={{ color: 'var(--color-crimson)' }} aria-hidden="true" />
              </div>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
              {ruta.description}
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                className="text-xs px-2.5 py-1 rounded-lg font-medium"
                style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
              >
                {ruta.duration}
              </span>
              <span
                className="text-xs px-2.5 py-1 rounded-lg font-medium"
                style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
              >
                {ruta.distance}
              </span>
              <span
                className="text-xs px-2.5 py-1 rounded-lg font-medium"
                style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
              >
                {ruta.stops.length} paradas
              </span>
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
