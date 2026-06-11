'use client'

import Image from 'next/image'
import Link from 'next/link'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { use } from 'react'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, Heart, Sun, Translate, Coins, Calendar, Star,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { Card } from '@/components/ui/Card'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useFavorites } from '@/hooks/useFavorites'
import { findDestino, lugaresDeDestino, comerciosDeDestino } from '@/lib/data'

// ─── Data ───────────────────────────────────────────────────────────────────

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DestinoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { favorites, toggleFavorite } = useFavorites()
  const revealRef = useScrollReveal()

  const destino = findDestino(id)
  if (!destino) notFound()

  const saved = favorites.has(destino.id)
  const lugares = lugaresDeDestino(destino.id)
  const comercios = comerciosDeDestino(destino.id)
  const gastronomia = comercios.filter(c => !c.badge)
  const beneficios = comercios.filter(c => !!c.badge)

  const facts = [
    { Icon: Sun,       label: 'Clima',       value: destino.facts.clima },
    { Icon: Translate, label: 'Idioma',      value: destino.facts.idioma },
    { Icon: Coins,     label: 'Moneda',      value: destino.facts.moneda },
    { Icon: Calendar,  label: 'Mejor época', value: destino.facts.epoca },
  ]

  return (
    <article ref={revealRef} className="min-h-screen pb-20" style={{ background: 'var(--color-surface)' }}>

      {/* ── Hero — receptor del morph desde la card ── */}
      <section
        className="relative overflow-hidden"
        style={{
          height: '45vh', minHeight: '320px', maxHeight: '520px',
          viewTransitionName: `card-${destino.id}`,
        } as React.CSSProperties}
      >
        <Image
          src={destino.image}
          alt={`Vista de ${destino.title}`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />

        {/* Gradient: dark bottom for text legibility, slight dark top for controls */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.28) 0%, transparent 30%, transparent 50%, rgba(0,0,0,0.72) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Back */}
        <TransitionLink
          href="/explorar"
          aria-label="Volver a Explorar"
          className="absolute top-6 left-8 flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-white cursor-pointer transition-opacity hover:opacity-80"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Explorar
        </TransitionLink>

        {/* Rating */}
        <div
          className="absolute top-6 right-8 flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}
        >
          <Star size={13} weight="fill" color="#FBBF24" aria-hidden="true" />
          <span className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-family-heading)', fontVariantNumeric: 'tabular-nums' }}>
            {destino.rating}
          </span>
          <span className="text-xs text-white/70" style={{ fontVariantNumeric: 'tabular-nums' }}>
            ({destino.reviewCount.toLocaleString('es')})
          </span>
        </div>

        {/* Name block — bottom left */}
        <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 lg:px-12 pb-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p
                className="text-white/80 text-sm font-medium mb-1 uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-family-heading)', letterSpacing: '0.12em' }}
              >
                {destino.country}
              </p>
              <h1
                className="text-white font-bold leading-none"
                style={{
                  fontFamily: 'var(--font-family-display)',
                  fontSize: 'clamp(2.75rem, 4vw + 1rem, 5.5rem)',
                  textWrap: 'balance',
                  letterSpacing: '-0.015em',
                }}
              >
                {destino.title}
              </h1>
            </div>

            {/* Save button */}
            <button
              onClick={() => toggleFavorite(destino.id)}
              aria-label={saved ? 'Quitar de favoritos' : 'Guardar destino'}
              aria-pressed={saved}
              className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-200 active:scale-90 mb-1"
              style={{
                background: saved ? 'var(--color-crimson)' : 'rgba(0,0,0,0.35)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Heart
                size={18}
                weight={saved ? 'fill' : 'regular'}
                aria-hidden="true"
                style={{ color: 'white' }}
              />
            </button>
          </div>
        </div>
      </section>

      {/* ── Quick Facts ── */}
      <div
        className="border-b"
        style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}
      >
        <div className="px-5 sm:px-8 lg:px-12 py-6 w-full overflow-x-auto scroll-hide">
          <dl className="flex items-center gap-0 min-w-max">
            {facts.map((fact, i) => (
              <div key={fact.label} className="flex items-center">
                <div className="flex items-center gap-3.5 px-7 first:pl-0">
                  <fact.Icon
                    size={18}
                    weight="regular"
                    aria-hidden="true"
                    style={{ color: 'var(--color-crimson)', flexShrink: 0 }}
                  />
                  <div>
                    <dt
                      className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
                      style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-heading)', letterSpacing: '0.1em' }}
                    >
                      {fact.label}
                    </dt>
                    <dd
                      className="text-sm font-semibold"
                      style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-heading)' }}
                    >
                      {fact.value}
                    </dd>
                  </div>
                </div>
                {i < facts.length - 1 && (
                  <div
                    className="h-8 w-px flex-shrink-0"
                    style={{ background: 'var(--color-border)' }}
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-5 sm:px-8 lg:px-12 w-full">

        {/* Editorial paragraph */}
        <div className="reveal py-12 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <p
            className="text-base leading-relaxed"
            style={{
              maxWidth: '65ch',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-body)',
              lineHeight: '1.8',
              textWrap: 'pretty',
            } as React.CSSProperties}
          >
            {destino.editorial}
          </p>
        </div>

        {/* Lugares destacados */}
        {lugares.length > 0 && (
          <section aria-labelledby="heading-lugares" className="py-12 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <DestSection id="heading-lugares" eyebrow="Descubre" title="Lugares destacados" count={lugares.length} />
            <div
              className="grid gap-x-6 gap-y-10"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))' }}
            >
              {lugares.map((lugar, i) => (
                <Card key={lugar.id} {...lugar} revealDelay={i * 70} />
              ))}
            </div>
          </section>
        )}

        {/* Gastronomía */}
        {gastronomia.length > 0 && (
          <section aria-labelledby="heading-gastro" className="py-12 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <DestSection id="heading-gastro" eyebrow="Come y bebe" title="Gastronomía" count={gastronomia.length} />
            <div
              className="grid gap-x-6 gap-y-10"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))' }}
            >
              {gastronomia.map((place, i) => (
                <Card key={place.id} {...place} revealDelay={i * 70} href={`/red-travel/${place.id}`} />
              ))}
            </div>
          </section>
        )}

        {/* Red Travel */}
        {beneficios.length > 0 && (
          <section aria-labelledby="heading-red" className="py-12">
            <DestSection id="heading-red" eyebrow="Beneficios exclusivos" title="Red Travel" count={beneficios.length} />
            <div
              className="grid gap-x-6 gap-y-10"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))' }}
            >
              {beneficios.map((place, i) => (
                <Card key={place.id} {...place} revealDelay={i * 70} href={`/red-travel/${place.id}`} />
              ))}
            </div>
          </section>
        )}

      </div>
    </article>
  )
}

// ─── Section header ──────────────────────────────────────────────────────────

function DestSection({
  id, eyebrow, title, count,
}: {
  id: string; eyebrow: string; title: string; count: number
}) {
  return (
    <div
      className="reveal flex items-end justify-between mb-7 pb-3 border-b"
      style={{ borderColor: 'var(--color-text-primary)' }}
    >
      <div>
        <p
          className="text-[10px] font-semibold uppercase tracking-widest mb-1"
          style={{ color: 'var(--color-crimson)', fontFamily: 'var(--font-family-heading)', letterSpacing: '0.1em' }}
        >
          {eyebrow}
        </p>
        <h2
          id={id}
          style={{
            fontFamily: 'var(--font-family-display)',
            color: 'var(--color-text-primary)',
            fontSize: 'clamp(1.75rem, 2.5vw, 2.25rem)',
            letterSpacing: '-0.01em',
            fontWeight: 600,
            lineHeight: 1,
          }}
        >
          {title}
        </h2>
      </div>
      <span
        className="text-[11px] font-semibold uppercase flex-shrink-0 mb-0.5"
        style={{ color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums', letterSpacing: '0.08em' }}
      >
        {count} {count === 1 ? 'lugar' : 'lugares'}
      </span>
    </div>
  )
}
