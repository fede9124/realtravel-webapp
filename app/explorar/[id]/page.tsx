'use client'

import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { RouteCard } from '@/components/ui/RouteCard'
import { ImageCarousel } from '@/components/ui/ImageCarousel'
import { Tabs, type TabItem } from '@/components/ui/Tabs'
import { useState, useMemo } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import {
  ArrowLeft,
  ShareFat,
  DownloadSimple,
  Bookmark,
  Heart,
  MapPin,
  Info,
  Lightbulb,
  Star,
  ArrowSquareOut,
  NavigationArrow,
} from '@phosphor-icons/react'
import { use } from 'react'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { findLugar, findDestino, LUGARES, RUTAS, routeCreatorComercio, type Lugar } from '@/lib/data'
import { useFavorites } from '@/hooks/useFavorites'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { LoginPrompt } from '@/components/ui/LoginPrompt'

const PinMapView = dynamic(() => import('@/components/map/PinMapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full animate-pulse" style={{ background: 'var(--color-map-placeholder)' }} />
  ),
})

const DETAIL_TABS: TabItem[] = [
  { id: 'descripcion', label: 'Descripción' },
  { id: 'mas-info', label: 'Más información' },
  { id: 'consejos', label: 'Consejos prácticos' },
]

export default function LugarDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [liked, setLiked] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [activeTab, setActiveTab] = useState('descripcion')
  const { favorites, toggleFavorite } = useFavorites()
  const { showLogin, loginMessage, requireAuth, closeLogin } = useRequireAuth()

  const lugar = findLugar(id)
  if (!lugar) notFound()

  const saved = favorites.has(lugar.id)

  const allImages = useMemo(() => {
    const imgs = [lugar.image]
    if (lugar.images?.length) imgs.push(...lugar.images)
    return imgs
  }, [lugar.image, lugar.images])

  const associatedRoutes = useMemo(
    () => RUTAS.filter(r => r.stops.includes(lugar.id)),
    [lugar.id],
  )

  const related = LUGARES.filter(l => l.id !== lugar.id && l.location === lugar.location).slice(0, 4)

  const directionsUrl = lugar.lat && lugar.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${lugar.lat},${lugar.lng}`
    : null

  const revealRef = useScrollReveal()

  return (
    <div className="min-h-[100dvh]" style={{ background: 'var(--color-surface)' }}>
      {/* ── Carousel hero ── */}
      <ImageCarousel
        images={allImages}
        alt={lugar.title}
        style={{ viewTransitionName: `card-${lugar.id}` } as React.CSSProperties}
      >
        {/* Back button */}
        <div className="absolute top-6 left-5 sm:left-8 z-10" style={{ zIndex: 3 }}>
          <TransitionLink
            href="/explorar"
            aria-label="Volver a Explorar"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm text-sm font-medium transition-all hover:bg-white"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Explorar
          </TransitionLink>
        </div>

        {/* Share button */}
        <div className="absolute top-6 right-5 sm:right-8 z-10" style={{ zIndex: 3 }}>
          <button
            onClick={() => navigator.share?.({ title: lugar.title, url: window.location.href })}
            aria-label="Compartir"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm text-sm font-medium transition-all hover:bg-white"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <ShareFat size={16} weight="regular" aria-hidden="true" />
            Compartir
          </button>
        </div>
      </ImageCarousel>

      {/* ── Main content — 2 columns ── */}
      <div className="px-5 sm:px-8 lg:px-12 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Title block */}
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold mb-3"
                style={{
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family-heading)',
                  letterSpacing: '-0.01em',
                  textWrap: 'balance',
                } as React.CSSProperties}
              >
                {lugar.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span
                  className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full"
                  style={{ color: 'var(--color-crimson)', background: 'var(--color-crimson-light)' }}
                >
                  {lugar.category}
                </span>
                <div className="flex items-center gap-1">
                  <MapPin size={13} style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {lugar.location}{lugar.distance ? ` · ${lugar.distance}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={13} weight="fill" color="#FBBF24" />
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                    {lugar.rating.toFixed(1)}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>(124 reseñas)</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div>
              <Tabs tabs={DETAIL_TABS} activeId={activeTab} onChange={setActiveTab} />

              <div
                className="mt-6 rounded-2xl p-6"
                style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
              >
                {activeTab === 'descripcion' && (
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {lugar.description}
                  </p>
                )}

                {activeTab === 'mas-info' && (
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {[
                      { label: 'Horario', value: lugar.hours },
                      { label: 'Entrada', value: lugar.entry },
                      { label: 'Accesibilidad', value: 'Consultar acceso adaptado' },
                      { label: 'Categoría', value: lugar.category },
                    ].map(({ label, value }) => (
                      <li key={label}>
                        <span className="block text-xs font-semibold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
                          {label}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{value}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === 'consejos' && (
                  <ul className="flex flex-col gap-3">
                    {[
                      'Visita temprano por la mañana para evitar aglomeraciones.',
                      'Revisa el horario antes de ir: puede variar en festivos.',
                      'Lleva agua y protección solar si la visita es al aire libre.',
                      'Consulta a los locales por el mejor ángulo fotográfico.',
                    ].map(consejo => (
                      <li key={consejo} className="flex gap-2.5 items-start text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        <Lightbulb size={14} weight="fill" style={{ color: 'var(--color-crimson)', flexShrink: 0, marginTop: '3px' }} aria-hidden="true" />
                        <span>{consejo}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Review form — below tabs */}
            <ReviewSection />
          </div>

          {/* Right column — action card */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-6 rounded-2xl p-7 flex flex-col gap-5"
              style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
            >
              <h2 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
                Acciones
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <ActionButton
                  icon={<DownloadSimple size={18} weight="regular" />}
                  label={downloaded ? 'Descargado' : 'Descargar offline'}
                  active={downloaded}
                  onClick={() => setDownloaded(v => !v)}
                  fullWidth
                />
                <ActionButton
                  icon={<Bookmark size={18} />}
                  label={saved ? 'Guardado' : 'Guardar'}
                  active={saved}
                  onClick={() => { if (requireAuth('Iniciá sesión para guardar lugares')) toggleFavorite(lugar.id) }}
                  fullWidth
                />
              </div>

              <button
                onClick={() => { if (requireAuth('Iniciá sesión para dar like')) setLiked(v => !v) }}
                aria-pressed={liked}
                className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
                style={{
                  background: liked ? 'var(--color-crimson)' : 'var(--color-surface)',
                  color: liked ? 'white' : 'var(--color-text-primary)',
                  border: liked ? 'none' : '1.5px solid var(--color-border)',
                }}
              >
                <Heart size={18} fill={liked ? 'white' : 'transparent'} aria-hidden="true" />
                {liked ? 'Te gusta este lugar' : 'Me gusta'}
              </button>

              {/* Directions button */}
              {directionsUrl && (
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
                  style={{
                    background: 'var(--color-crimson)',
                    color: 'white',
                  }}
                >
                  <NavigationArrow size={18} weight="fill" aria-hidden="true" />
                  ¿Cómo llego?
                </a>
              )}

              {/* Map preview — square */}
              {lugar.lat && lugar.lng ? (
                <div className="rounded-xl overflow-hidden" style={{ aspectRatio: '1/1', position: 'relative' }}>
                  <PinMapView lat={lugar.lat} lng={lugar.lng} title={lugar.title} />
                  <Link
                    href="/mapa"
                    className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
                    style={{ background: 'var(--color-card)', color: 'var(--color-text-primary)', boxShadow: 'var(--shadow-card)' }}
                  >
                    <ArrowSquareOut size={12} aria-hidden="true" />
                    Abrir mapa
                  </Link>
                </div>
              ) : (
                <Link
                  href="/mapa"
                  className="rounded-xl overflow-hidden flex flex-col items-center justify-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ aspectRatio: '1/1', background: 'var(--color-map-placeholder)', color: 'var(--color-text-muted)' }}
                >
                  Ver en el mapa
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── Associated routes + related ── */}
        <div ref={revealRef}>
        {associatedRoutes.length > 0 && (
          <section aria-labelledby="heading-rutas" className="mt-14">
            <h2
              id="heading-rutas"
              className="mb-7"
              style={{
                fontFamily: 'var(--font-family-display)',
                color: 'var(--color-text-primary)',
                fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                letterSpacing: '-0.01em',
                fontWeight: 600,
                lineHeight: 1.1,
              }}
            >
              Rutas que pasan por aquí
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 360px))', gap: '24px' }}>
              {associatedRoutes.map(ruta => {
                const destino = findDestino(ruta.destinoId)
                const creator = routeCreatorComercio(ruta.id)
                return (
                  <RouteCard
                    key={ruta.id}
                    {...ruta}
                    destinoTitle={destino?.title}
                    createdBy={creator?.title ?? 'Real Travel'}
                    createdByHref={creator ? `/red-travel/${creator.id}` : undefined}
                  />
                )
              })}
            </div>
          </section>
        )}

        {/* ── Related places ── */}
        {related.length > 0 && (
          <section aria-labelledby="heading-relacionados" className="mt-14">
            <h2
              id="heading-relacionados"
              className="mb-7"
              style={{
                fontFamily: 'var(--font-family-display)',
                color: 'var(--color-text-primary)',
                fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                letterSpacing: '-0.01em',
                fontWeight: 600,
                lineHeight: 1.1,
              }}
            >
              Lugares relacionados
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 320px))', gap: '20px' }}>
              {related.map(r => (
                <Card key={r.id} {...r} />
              ))}
            </div>
          </section>
        )}
        </div>
      </div>

      <LoginPrompt open={showLogin} onClose={closeLogin} message={loginMessage} />
    </div>
  )
}

function ActionButton({
  icon,
  label,
  active = false,
  onClick,
  fullWidth = false,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  fullWidth?: boolean
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all active:scale-95 ${fullWidth ? 'w-full' : ''}`}
      style={{
        background: active ? 'var(--color-crimson-light)' : 'var(--color-surface)',
        color: active ? 'var(--color-crimson)' : 'var(--color-text-muted)',
        border: active ? '1.5px solid var(--color-crimson)' : '1.5px solid var(--color-border)',
      }}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  )
}

function ReviewSection() {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState('')
  const { showLogin, loginMessage, requireAuth, closeLogin } = useRequireAuth()

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
    >
      <h3 className="font-bold text-base mb-4" style={{ color: 'var(--color-text-primary)' }}>
        Deja tu reseña
      </h3>

      <div className="flex flex-col gap-4">
        <div className="flex gap-1.5" role="group" aria-label="Calificación con estrellas">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                size={26}
                weight={star <= (hover || rating) ? 'fill' : 'regular'}
                style={{ color: star <= (hover || rating) ? '#FBBF24' : 'var(--color-border)' }}
              />
            </button>
          ))}
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Comparte tu experiencia con otros viajeros..."
          aria-label="Escribe tu reseña"
          rows={3}
          className="w-full rounded-xl p-3 text-sm outline-none resize-none transition-all"
          style={{
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            border: '1.5px solid var(--color-border)',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-crimson)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
        />

        <button
          disabled={rating === 0 || text.trim().length === 0}
          onClick={() => requireAuth('Iniciá sesión para publicar tu reseña')}
          className="self-start px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--color-crimson)' }}
        >
          Publicar reseña
        </button>
      </div>

      <LoginPrompt open={showLogin} onClose={closeLogin} message={loginMessage} />
    </div>
  )
}
