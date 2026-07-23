'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { ImageCarousel } from '@/components/ui/ImageCarousel'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import {
  ArrowLeft, ShareFat, MapPin, CalendarBlank, Clock, Ticket, NavigationArrow, User, Globe as GlobeIcon,
} from '@phosphor-icons/react'
import { use } from 'react'
import { notFound } from 'next/navigation'
import { findEvento, EVENTOS } from '@/lib/data'
import { EventCard } from '@/components/ui/EventCard'

const PinMapView = dynamic(() => import('@/components/map/PinMapView'), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse" style={{ background: 'var(--color-map-placeholder)' }} />,
})

const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const DAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

function formatFullDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  const dayName = DAYS_ES[d.getDay()]
  const day = d.getDate()
  const month = MONTHS_ES[d.getMonth()]
  const year = d.getFullYear()
  return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${day} de ${month}, ${year}`
}

const CATEGORY_COLORS: Record<string, string> = {
  Festival: '#e85d04',
  Música: '#7b2cbf',
  Gastronomía: '#d00000',
  Deporte: '#2d6a4f',
  Cultural: '#1d3557',
  Mercado: '#b08968',
  Naturaleza: '#3a7d44',
}

export default function DemoEventoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const revealRef = useScrollReveal()

  const evento = findEvento(id)
  if (!evento) notFound()

  const catColor = CATEGORY_COLORS[evento.category] ?? 'var(--color-crimson)'

  const directionsUrl = evento.lat && evento.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${evento.lat},${evento.lng}`
    : null

  const relatedEvents = EVENTOS
    .filter(e => e.id !== evento.id && e.destinoId === evento.destinoId)
    .slice(0, 3)

  return (
    <div ref={revealRef} className="min-h-[100dvh]" style={{ background: 'var(--color-surface)' }}>
      <ImageCarousel images={[evento.image]} alt={evento.title} style={{ viewTransitionName: `card-${evento.id}` } as React.CSSProperties}>
        <div className="absolute top-6 left-5 sm:left-8 z-10" style={{ zIndex: 3 }}>
          <TransitionLink href="/demo/eventos" aria-label="Volver" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm text-sm font-medium transition-all hover:bg-white" style={{ color: 'var(--color-text-primary)' }}>
            <ArrowLeft size={16} /> Eventos
          </TransitionLink>
        </div>
        <div className="absolute top-6 right-5 sm:right-8 z-10" style={{ zIndex: 3 }}>
          <button onClick={() => navigator.share?.({ title: evento.title, url: window.location.href })} aria-label="Compartir"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm text-sm font-medium transition-all hover:bg-white" style={{ color: 'var(--color-text-primary)' }}>
            <ShareFat size={16} /> Compartir
          </button>
        </div>
      </ImageCarousel>

      <div className="px-5 sm:px-8 lg:px-12 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div>
              {/* Category chip */}
              <span
                className="inline-block text-xs font-bold uppercase px-3 py-1 rounded-full mb-3"
                style={{ color: catColor, background: `${catColor}14`, letterSpacing: '0.04em' }}
              >
                {evento.category}
              </span>

              <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-heading)', letterSpacing: '-0.01em' }}>
                {evento.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} weight="fill" />
                  {evento.location}
                </span>
                {evento.address && (
                  <span style={{ opacity: 0.6 }}>· {evento.address}</span>
                )}
              </div>
            </div>

            {/* Date block */}
            <div className="flex gap-4 p-5 rounded-2xl" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-center w-14 h-14 rounded-xl flex-shrink-0" style={{ background: 'var(--color-crimson-light)' }}>
                <CalendarBlank size={24} weight="fill" style={{ color: 'var(--color-crimson)' }} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-base font-bold" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-heading)' }}>
                  {formatFullDate(evento.dateStart)}
                </span>
                {evento.dateEnd && evento.dateEnd !== evento.dateStart && (
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    hasta {formatFullDate(evento.dateEnd)}
                  </span>
                )}
                {evento.time && (
                  <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <Clock size={13} />
                    {evento.time}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="reveal">
              <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
                {evento.description}
              </p>
            </div>

            {/* Organizer */}
            {evento.organizer && (
              <div className="reveal flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center justify-center w-9 h-9 rounded-full" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <User size={15} style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase block" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>Organiza</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{evento.organizer}</span>
                </div>
              </div>
            )}

            {/* Website */}
            {evento.website && (
              <a
                href={evento.website}
                target="_blank"
                rel="noopener noreferrer"
                className="reveal inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                style={{ color: 'var(--color-crimson)', textDecoration: 'none' }}
              >
                <GlobeIcon size={15} /> Más información
              </a>
            )}

            {/* Related events */}
            {relatedEvents.length > 0 && (
              <div className="reveal flex flex-col gap-4 mt-4">
                <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--color-text-primary)' }}>
                  Otros eventos
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 320px))', gap: '20px' }}>
                  {relatedEvents.map(e => (
                    <EventCard key={e.id} {...e} href={`/demo/eventos/${e.id}`} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-[88px] lg:self-start">
            {/* Map */}
            {evento.lat && evento.lng && (
              <div className="rounded-2xl overflow-hidden" style={{ height: '240px', border: '1px solid var(--color-border)' }}>
                <PinMapView lat={evento.lat} lng={evento.lng} title={evento.title} />
              </div>
            )}
            {/* Directions */}
            {directionsUrl && (
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-150 hover:scale-[1.02] active:scale-95"
                style={{ background: 'var(--color-crimson)', color: 'white', textDecoration: 'none', boxShadow: 'var(--shadow-fab)' }}>
                <NavigationArrow size={15} weight="fill" />
                Cómo llegar
              </a>
            )}
            {/* Quick info */}
            <div className="p-4 rounded-2xl flex flex-col gap-3" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--color-text-primary)' }}>Información rápida</h3>
              <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex items-start gap-2">
                  <CalendarBlank size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Fecha: </span>
                    <span style={{ color: 'var(--color-text-primary)' }}>
                      {new Date(evento.dateStart + 'T12:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                      {evento.dateEnd && ` – ${new Date(evento.dateEnd + 'T12:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' })}`}
                    </span>
                  </div>
                </div>
                {evento.time && (
                  <div className="flex items-start gap-2">
                    <Clock size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                    <div>
                      <span style={{ color: 'var(--color-text-muted)' }}>Hora: </span>
                      <span style={{ color: 'var(--color-text-primary)' }}>{evento.time}</span>
                    </div>
                  </div>
                )}
                {evento.price && (
                  <div className="flex items-start gap-2">
                    <Ticket size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                    <div>
                      <span style={{ color: 'var(--color-text-muted)' }}>Precio: </span>
                      <span style={{ color: 'var(--color-text-primary)', fontWeight: evento.price === 'Gratuito' ? 600 : 400 }}>{evento.price}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                  <div>
                    <span style={{ color: 'var(--color-text-muted)' }}>Ubicación: </span>
                    <span style={{ color: 'var(--color-text-primary)' }}>{evento.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
