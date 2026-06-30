'use client'

import dynamic from 'next/dynamic'
import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { ArrowLeft, Clock, Path, MapPin, Star, DoorOpen, Timer, BookmarkSimple } from '@phosphor-icons/react'
import { findRuta, findLugar, findDestino, routeCreatorComercio } from '@/lib/data'
import { useFavorites } from '@/hooks/useFavorites'

const RouteMapView = dynamic(() => import('@/components/map/RouteMapView'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: 'var(--color-map-placeholder)' }}
    >
      <div
        className="w-8 h-8 rounded-full border-4 animate-spin"
        style={{ borderColor: 'var(--color-crimson)', borderTopColor: 'transparent' }}
        role="status"
        aria-label="Cargando mapa"
      />
    </div>
  ),
})

export default function RutaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const { favorites, toggleFavorite } = useFavorites()

  const ruta = findRuta(id)
  if (!ruta) notFound()

  const destino = findDestino(ruta.destinoId)
  const stops = ruta.stops.map(findLugar).filter(Boolean) as NonNullable<ReturnType<typeof findLugar>>[]
  const creator = routeCreatorComercio(ruta.id)

  function handleStopClick(idx: number) {
    setSelectedIdx(prev => prev === idx ? null : idx)
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden" style={{ background: 'var(--color-surface)' }}>

      {/* ── Side panel ── */}
      <div
        className="flex flex-col overflow-hidden flex-shrink-0 border-r"
        style={{ width: '380px', background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b flex-shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-5">
            <TransitionLink
              href="/explorar"
              className="inline-flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-heading)' }}
            >
              <ArrowLeft size={13} aria-hidden="true" />
              Explorar
            </TransitionLink>
            <button
              onClick={() => toggleFavorite(ruta.id)}
              aria-label={favorites.has(ruta.id) ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: favorites.has(ruta.id) ? 'var(--color-crimson)' : 'var(--color-text-muted)' }}
            >
              <BookmarkSimple size={18} weight={favorites.has(ruta.id) ? 'fill' : 'regular'} aria-hidden="true" />
            </button>
          </div>

          {destino && (
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-1.5"
              style={{ color: 'var(--color-crimson)', fontFamily: 'var(--font-family-heading)', letterSpacing: '0.12em' }}
            >
              {destino.title}
            </p>
          )}
          <h1
            style={{
              fontFamily: 'var(--font-family-display)',
              color: 'var(--color-text-primary)',
              fontSize: 'clamp(1.5rem, 2vw, 1.875rem)',
              letterSpacing: '-0.01em',
              fontWeight: 600,
              lineHeight: 1.1,
            }}
          >
            {ruta.title}
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)', lineHeight: '1.65' }}>
            {ruta.description}
          </p>

          {/* Metadata chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { icon: Clock, label: ruta.duration },
              { icon: Path, label: ruta.distance },
              { icon: MapPin, label: `${stops.length} paradas` },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
              >
                <Icon size={12} aria-hidden="true" style={{ color: 'var(--color-crimson)' }} />
                {label}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            Creada por{' '}
            {creator ? (
              <Link href={`/red-travel/${creator.id}`} className="hover:underline" style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {creator.title}
              </Link>
            ) : (
              <span style={{ fontWeight: 600 }}>Real Travel</span>
            )}
          </p>
        </div>

        {/* Stops list */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pt-5 pb-2">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-heading)', letterSpacing: '0.1em' }}
            >
              Paradas
            </p>
          </div>

          <div className="px-4 pb-6">
            {stops.map((lugar, i) => {
              const isSelected = selectedIdx === i
              const isLast = i === stops.length - 1

              return (
                <div key={lugar.id} className="flex gap-3">
                  {/* Timeline */}
                  <div className="flex flex-col items-center flex-shrink-0" style={{ width: '32px' }}>
                    <button
                      onClick={() => handleStopClick(i)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 cursor-pointer flex-shrink-0"
                      style={{
                        background: isSelected ? 'var(--color-crimson)' : 'var(--color-crimson-light)',
                        color: isSelected ? '#ffffff' : 'var(--color-crimson)',
                        fontFamily: 'var(--font-family-heading)',
                        boxShadow: isSelected ? '0 2px 8px rgba(196,18,48,0.35)' : 'none',
                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      }}
                      aria-label={`Centrar mapa en ${lugar.title}`}
                    >
                      {i + 1}
                    </button>
                    {!isLast && (
                      <div
                        className="w-px flex-1 my-1"
                        style={{ background: 'var(--color-border)', minHeight: '24px' }}
                      />
                    )}
                  </div>

                  {/* Card */}
                  <button
                    onClick={() => handleStopClick(i)}
                    className="flex-1 text-left mb-3 rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
                    style={{
                      background: isSelected ? 'var(--color-crimson-light)' : 'var(--color-surface)',
                      border: `1px solid ${isSelected ? 'rgba(196,18,48,0.2)' : 'var(--color-border)'}`,
                      boxShadow: isSelected ? '0 2px 12px rgba(196,18,48,0.1)' : 'none',
                    }}
                  >
                    <div className="flex gap-3 p-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={lugar.image}
                          alt={lugar.title}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <p
                          className="font-semibold text-sm leading-tight mb-1 truncate"
                          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-heading)' }}
                        >
                          {lugar.title}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                            style={{ background: 'var(--color-crimson-light)', color: 'var(--color-crimson)' }}
                          >
                            {lugar.category}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Star size={10} weight="fill" color="#FBBF24" aria-hidden="true" />
                            <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                              {lugar.rating}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isSelected && (
                      <div
                        className="px-3 pb-3 border-t"
                        style={{ borderColor: 'rgba(196,18,48,0.15)' }}
                      >
                        <p className="text-xs leading-relaxed mt-2.5 mb-3" style={{ color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                          {lugar.description.slice(0, 160)}…
                        </p>
                        <div className="flex gap-2 flex-wrap mb-3">
                          {[
                            { icon: Timer, text: lugar.hours },
                            { icon: DoorOpen, text: lugar.entry },
                          ].map(({ icon: Icon, text }) => (
                            <span
                              key={text}
                              className="inline-flex items-center gap-1 text-[10px] font-medium"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              <Icon size={10} aria-hidden="true" style={{ color: 'var(--color-crimson)' }} />
                              {text}
                            </span>
                          ))}
                        </div>
                        <Link
                          href={`/explorar/${lugar.id}`}
                          onClick={e => e.stopPropagation()}
                          className="block text-center text-xs font-semibold py-2 rounded-lg text-white transition-opacity hover:opacity-90"
                          style={{ background: 'var(--color-crimson)' }}
                        >
                          Ver lugar completo
                        </Link>
                      </div>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Map ── */}
      <div className="flex-1 relative">
        <RouteMapView
          stops={stops}
          selectedIdx={selectedIdx}
          onMarkerClick={handleStopClick}
        />
      </div>
    </div>
  )
}
