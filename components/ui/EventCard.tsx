'use client'

import Image from 'next/image'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { MapPin, Clock } from '@phosphor-icons/react'
import type { Evento } from '@/lib/data'

function formatDateBadge(dateStart: string, dateEnd?: string) {
  const start = new Date(dateStart + 'T12:00:00')
  const day = start.getDate()
  const month = start.toLocaleString('es', { month: 'short' }).toUpperCase().replace('.', '')

  if (dateEnd) {
    const end = new Date(dateEnd + 'T12:00:00')
    const endDay = end.getDate()
    if (end.getMonth() === start.getMonth()) {
      return { day: `${day}–${endDay}`, month }
    }
    const endMonth = end.toLocaleString('es', { month: 'short' }).toUpperCase().replace('.', '')
    return { day: `${day}–${endDay}`, month: `${month}/${endMonth}` }
  }

  return { day: String(day), month }
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

interface EventCardProps extends Evento {
  href?: string
  revealDelay?: number
  priority?: boolean
}

export function EventCard({
  id,
  image,
  title,
  category,
  location,
  time,
  price,
  dateStart,
  dateEnd,
  href: hrefOverride,
  revealDelay = 0,
  priority = false,
}: EventCardProps) {
  const href = hrefOverride ?? `/demo/eventos/${id}`
  const badge = formatDateBadge(dateStart, dateEnd)
  const catColor = CATEGORY_COLORS[category] ?? 'var(--color-crimson)'

  return (
    <TransitionLink
      href={href}
      style={{
        display: 'block',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'var(--color-card)',
        boxShadow: 'var(--shadow-card)',
        textDecoration: 'none',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        animationDelay: `${revealDelay}ms`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '3/2', overflow: 'hidden' }}>
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, 360px"
          priority={priority}
          style={{
            objectFit: 'cover',
            viewTransitionName: `card-${id}`,
          }}
        />

        {/* Date badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            background: 'white',
            borderRadius: '10px',
            padding: '6px 10px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            lineHeight: 1,
            minWidth: '48px',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: badge.day.length > 3 ? '16px' : '22px',
              fontWeight: 800,
              color: '#1a1a1a',
              fontFamily: 'var(--font-family-heading)',
            }}
          >
            {badge.day}
          </span>
          <span
            style={{
              display: 'block',
              fontSize: '10px',
              fontWeight: 700,
              color: '#666',
              letterSpacing: '0.05em',
              marginTop: '1px',
            }}
          >
            {badge.month}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px 16px' }}>
        {/* Category chip */}
        <span
          style={{
            display: 'inline-block',
            fontSize: '11px',
            fontWeight: 700,
            color: catColor,
            background: `${catColor}14`,
            padding: '3px 10px',
            borderRadius: '20px',
            letterSpacing: '0.02em',
            marginBottom: '8px',
          }}
        >
          {category}
        </span>

        {/* Title */}
        <h3
          style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-family-heading)',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </h3>

        {/* Location + time */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '8px',
            fontSize: '12.5px',
            color: 'var(--color-text-muted)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={13} weight="fill" style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {location}
            </span>
          </span>
          {time && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <Clock size={13} weight="regular" />
              {time.split('–')[0].trim()}
            </span>
          )}
        </div>

        {/* Price */}
        {price && (
          <p
            style={{
              margin: '8px 0 0',
              fontSize: '12px',
              fontWeight: 600,
              color: price === 'Gratuito' ? '#2d6a4f' : 'var(--color-text-muted)',
            }}
          >
            {price}
          </p>
        )}
      </div>
    </TransitionLink>
  )
}
