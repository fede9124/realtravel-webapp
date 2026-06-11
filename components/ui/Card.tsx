'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Heart, Star, ImageBroken } from '@phosphor-icons/react'
import { TransitionLink } from '@/components/ui/TransitionLink'

interface CardProps {
  id: string
  image: string
  category: string
  title: string
  location: string
  distance?: string
  rating?: number
  badge?: string
  isFavorite?: boolean
  onFavoriteToggle?: () => void
  href?: string
  className?: string
  revealDelay?: number
}

/**
 * Card editorial: imagen + texto directo sobre el fondo de página.
 * Sin caja, sin sombra — la jerarquía la dan el espacio, el kicker y la serif.
 */
export function Card({
  id,
  image,
  category,
  title,
  location,
  distance,
  rating,
  badge,
  isFavorite = false,
  onFavoriteToggle,
  href,
  className = '',
  revealDelay = 0,
}: CardProps) {
  const cardHref = href ?? `/explorar/${id}`
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <article className={`reveal group relative ${className}`} data-delay={revealDelay}>

      {/* Imagen — morfea hacia el hero del detalle vía View Transition */}
      <TransitionLink href={cardHref} aria-label={`Ver ${title}`} className="block cursor-pointer">
        <div
          className="relative overflow-hidden rounded-md"
          style={{
            aspectRatio: '3/2',
            background: 'var(--color-border)',
            viewTransitionName: `card-${id}`,
          } as React.CSSProperties}
        >
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 shimmer" aria-hidden="true" />
          )}

          {imgError ? (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              style={{ background: 'var(--color-map-placeholder)' }}
            >
              <ImageBroken size={28} weight="regular" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} aria-hidden="true" />
              <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                Imagen no disponible
              </span>
            </div>
          ) : (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease, transform 0.5s ease-out' }}
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          )}

          {badge && (
            <div className="absolute top-3 left-3" aria-label={`Descuento: ${badge}`}>
              <RosetteBadge label={badge} />
            </div>
          )}
        </div>
      </TransitionLink>

      {/* Favorito — sobre la imagen */}
      {onFavoriteToggle && (
        <button
          onClick={e => { e.preventDefault(); onFavoriteToggle() }}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          aria-pressed={isFavorite}
          className="absolute top-2.5 right-2.5 w-11 h-11 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 active:scale-90"
          style={{
            background: isFavorite ? 'var(--color-crimson)' : 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(6px)',
            boxShadow: isFavorite ? 'var(--shadow-fab)' : '0 1px 4px rgba(0,0,0,0.15)',
          }}
        >
          <Heart
            size={17}
            weight={isFavorite ? 'fill' : 'regular'}
            aria-hidden="true"
            style={{ color: isFavorite ? 'white' : 'var(--color-text-primary)' }}
          />
        </button>
      )}

      {/* Texto editorial — directo sobre el fondo */}
      <TransitionLink href={cardHref} className="block pt-4 cursor-pointer">

        {/* Kicker: ubicación · categoría */}
        <p
          className="text-[11px] font-semibold uppercase mb-2 truncate"
          style={{
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-family-body)',
            letterSpacing: '0.08em',
          }}
        >
          {location} · {category}
        </p>

        {/* Título serif */}
        <h3
          className="font-bold leading-snug line-clamp-2 transition-colors duration-150 group-hover:underline"
          style={{
            fontFamily: 'var(--font-family-display)',
            color: 'var(--color-text-primary)',
            fontSize: '19px',
            letterSpacing: '-0.005em',
            textDecorationThickness: '1.5px',
            textUnderlineOffset: '3px',
          }}
        >
          {title}
        </h3>

        {/* Meta: rating + distancia */}
        {(rating !== undefined || distance) && (
          <div className="flex items-center gap-2 mt-2">
            {rating !== undefined && (
              <span className="flex items-center gap-1" aria-label={`Calificación: ${rating.toFixed(1)} de 5`}>
                <Star size={11} weight="fill" color="#dca102" aria-hidden="true" />
                <span
                  className="text-xs font-semibold"
                  style={{ color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}
                >
                  {rating.toFixed(1)}
                </span>
              </span>
            )}
            {distance && (
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {rating !== undefined ? '· ' : ''}{distance}
              </span>
            )}
          </div>
        )}
      </TransitionLink>
    </article>
  )
}

function RosetteBadge({ label }: { label: string }) {
  return (
    <div className="relative w-11 h-11 flex items-center justify-center">
      <svg viewBox="0 0 44 44" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <path
          d="M22 2 l2.6 5.5 5.8-2.8-1.4 6.2 6.2 0.8-3.8 4.9 4.7 3.8-5.4 2.2 1.4 6.2-5.8-2.8-2.6 5.5-2.6-5.5-5.8 2.8 1.4-6.2-5.4-2.2 4.7-3.8-3.8-4.9 6.2-0.8-1.4-6.2 5.8 2.8Z"
          fill="var(--color-crimson)"
        />
      </svg>
      <span className="relative z-10 text-white text-[9px] font-black leading-none text-center px-0.5" style={{ fontFamily: 'var(--font-family-body)' }}>
        {label}
      </span>
    </div>
  )
}
