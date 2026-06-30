'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { BookmarkSimple, Path, ImageBroken } from '@phosphor-icons/react'
import { TransitionLink } from '@/components/ui/TransitionLink'
import type { Ruta } from '@/lib/data'

const DIFFICULTY_COLOR: Record<Ruta['difficulty'], string> = {
  'Fácil': '#16A34A',
  'Moderada': '#D97706',
  'Desafiante': '#DC2626',
}

interface RouteCardProps extends Ruta {
  destinoTitle?: string
  createdBy?: string
  createdByHref?: string
  isFavorite?: boolean
  onFavoriteToggle?: () => void
  className?: string
  style?: React.CSSProperties
  revealDelay?: number
  priority?: boolean
}

export function RouteCard({
  id,
  image,
  title,
  destinoId,
  destinoTitle,
  createdBy,
  createdByHref,
  difficulty,
  duration,
  distance,
  stops,
  isFavorite = false,
  onFavoriteToggle,
  className = '',
  style,
  revealDelay = 0,
  priority = false,
}: RouteCardProps) {
  const href = `/rutas/${id}`
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <article className={`reveal group relative ${className}`} style={style} data-delay={revealDelay}>

      <TransitionLink href={href} aria-label={`Ver ruta: ${title}`} className="block cursor-pointer">
        <div
          className="relative overflow-hidden rounded-md"
          style={{ aspectRatio: '3/2', background: 'var(--color-border)' }}
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
              priority={priority}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s ease, transform 0.5s ease-out' }}
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          )}

          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white"
            style={{ background: DIFFICULTY_COLOR[difficulty], fontFamily: 'var(--font-family-body)' }}
          >
            {difficulty}
          </div>
        </div>
      </TransitionLink>

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
          <BookmarkSimple
            size={17}
            weight={isFavorite ? 'fill' : 'regular'}
            aria-hidden="true"
            style={{ color: isFavorite ? 'white' : 'var(--color-text-primary)' }}
          />
        </button>
      )}

      <TransitionLink href={href} className="block pt-4 cursor-pointer">
        <p
          className="text-[11px] font-semibold uppercase mb-2 truncate"
          style={{
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-family-body)',
            letterSpacing: '0.08em',
          }}
        >
          {destinoTitle ?? destinoId} · Ruta
        </p>

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

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <Path size={11} weight="bold" aria-hidden="true" style={{ color: 'var(--color-crimson)' }} />
            {duration}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>· {distance}</span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>· {stops.length} paradas</span>
        </div>
      </TransitionLink>
      {createdBy && (
        <p className="text-[11px] mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
          Creada por{' '}
          {createdByHref ? (
            <Link
              href={createdByHref}
              onClick={e => e.stopPropagation()}
              className="hover:underline"
              style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}
            >
              {createdBy}
            </Link>
          ) : (
            <span style={{ fontWeight: 600 }}>{createdBy}</span>
          )}
        </p>
      )}
    </article>
  )
}
