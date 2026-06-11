'use client'

import Image from 'next/image'
import Link from 'next/link'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { useState } from 'react'
import {
  ArrowLeft,
  ShareFat,
  DownloadSimple,
  Bookmark,
  Heart,
  MapPin,
  Info,
  FileText,
  Lightbulb,
  Star,
  ChatText,
  MapTrifold,
} from '@phosphor-icons/react'
import { use } from 'react'
import { notFound } from 'next/navigation'
import { Accordion, type AccordionItem } from '@/components/ui/Accordion'
import { Card } from '@/components/ui/Card'
import { findLugar, LUGARES, type Lugar } from '@/lib/data'
import { useFavorites } from '@/hooks/useFavorites'

function buildAccordion(lugar: Lugar): AccordionItem[] {
  return [
    {
      id: 'descripcion',
      title: 'Descripción',
      icon: <FileText size={15} />,
      content: <p>{lugar.description}</p>,
    },
    {
      id: 'mas-info',
      title: 'Más información',
      icon: <Info size={15} />,
      content: (
        <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
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
              <span className="text-xs">{value}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'consejos',
      title: 'Consejos prácticos',
      icon: <Lightbulb size={15} />,
      content: (
        <ul className="flex flex-col gap-2.5">
          {[
            'Visita temprano por la mañana para evitar aglomeraciones.',
            'Revisa el horario antes de ir: puede variar en festivos.',
            'Lleva agua y protección solar si la visita es al aire libre.',
            'Consulta a los locales por el mejor ángulo fotográfico.',
          ].map(consejo => (
            <li key={consejo} className="flex gap-2.5 items-start">
              <Info size={13} weight="regular" style={{ color: 'var(--color-crimson)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
              <span>{consejo}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'resena',
      title: 'Deja tu reseña',
      icon: <ChatText size={15} weight="regular" />,
      content: <ReviewForm />,
    },
  ]
}

export default function LugarDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [liked, setLiked] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const { favorites, toggleFavorite } = useFavorites()

  const lugar = findLugar(id)
  if (!lugar) notFound()

  const saved = favorites.has(lugar.id)
  const related = LUGARES.filter(l => l.id !== lugar.id).slice(0, 3)

  return (
    <div className="min-h-[100dvh]" style={{ background: 'var(--color-surface)' }}>
      {/* Hero image — receptor del morph desde la card */}
      <div
        className="relative h-80 w-full overflow-hidden"
        style={{ viewTransitionName: `card-${lugar.id}` } as React.CSSProperties}
      >
        <Image
          src={lugar.image.replace('w=600', 'w=1200')}
          alt={lugar.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20" />

        {/* Breadcrumb back button */}
        <div className="absolute top-6 left-8 flex items-center gap-3">
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

        {/* Actions top-right */}
        <div className="absolute top-6 right-8 flex items-center gap-2">
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
      </div>

      {/* Main content — 2 columns */}
      <div className="px-5 sm:px-8 lg:px-12 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left: main content */}
          <div className="lg:col-span-2 flex flex-col gap-7">
            {/* Title block */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
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
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>{lugar.rating.toFixed(1)}</span>
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>(124 reseñas)</span>
                </div>
              </div>
              <h1
                className="text-3xl font-bold"
                style={{
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-family-heading)',
                  letterSpacing: '-0.01em',
                  textWrap: 'balance',
                } as React.CSSProperties}
              >
                {lugar.title}
              </h1>
            </div>

            {/* Accordion */}
            <Accordion items={buildAccordion(lugar)} defaultOpenId="descripcion" />
          </div>

          {/* Right: action card */}
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
                  onClick={() => toggleFavorite(lugar.id)}
                  fullWidth
                />
              </div>

              <button
                onClick={() => setLiked(v => !v)}
                aria-pressed={liked}
                className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
                style={{
                  background: liked ? 'var(--color-crimson)' : 'var(--color-surface)',
                  color: liked ? 'white' : 'var(--color-text-primary)',
                  border: liked ? 'none' : '1.5px solid var(--color-border)',
                }}
              >
                <Heart
                  size={18}
                  fill={liked ? 'white' : 'transparent'}
                  aria-hidden="true"
                />
                {liked ? 'Te gusta este lugar' : 'Me gusta'}
              </button>

              {/* Map preview */}
              <Link
                href="/mapa"
                className="rounded-xl overflow-hidden flex flex-col items-center justify-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
                style={{
                  height: '140px',
                  background: 'var(--color-map-placeholder)',
                  color: 'var(--color-text-muted)',
                }}
              >
                <MapTrifold size={28} weight="regular" aria-hidden="true" style={{ color: 'var(--color-text-muted)' }} />
                Ver en el mapa
              </Link>
            </div>
          </div>
        </div>

        {/* Related places — full width */}
        <section aria-labelledby="heading-relacionados" className="mt-12">
          <h2
            id="heading-relacionados"
            className="mb-7"
            style={{
              fontFamily: 'var(--font-family-display)',
              color: 'var(--color-text-primary)',
              fontSize: 'clamp(2rem, 3vw, 2.75rem)',
              letterSpacing: '-0.01em',
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            Lugares relacionados
          </h2>
          <div className="grid gap-x-5 gap-y-9" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))' }}>
            {related.map(r => (
              <Card key={r.id} {...r} />
            ))}
          </div>
        </section>
      </div>
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

function ReviewForm() {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState('')

  return (
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
              style={{
                color: star <= (hover || rating) ? '#FBBF24' : 'var(--color-border)',
              }}
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
        className="self-start px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'var(--color-crimson)' }}
      >
        Publicar reseña
      </button>
    </div>
  )
}
