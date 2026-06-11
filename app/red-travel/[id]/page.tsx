'use client'

import Image from 'next/image'
import Link from 'next/link'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { useState, use } from 'react'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, MapPin, Clock, Phone, Globe, Tag, CheckCircle, Check,
} from '@phosphor-icons/react'
import { findComercio } from '@/lib/data'

export default function ComercioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [claimed, setClaimed] = useState(false)

  const comercio = findComercio(id)
  if (!comercio) notFound()

  return (
    <article className="min-h-screen pb-20" style={{ background: 'var(--color-surface)' }}>

      {/* Hero — receptor del morph desde la card */}
      <section
        className="relative overflow-hidden"
        style={{
          height: '40vh', minHeight: '280px', maxHeight: '420px',
          viewTransitionName: `card-${comercio.id}`,
        } as React.CSSProperties}
      >
        <Image
          src={comercio.image.replace('w=600', 'w=1400')}
          alt={comercio.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.55) 100%)' }}
          aria-hidden="true"
        />

        <TransitionLink
          href="/red-travel"
          aria-label="Volver a Red Travel"
          className="absolute top-6 left-8 flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-white cursor-pointer transition-opacity hover:opacity-80"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Red Travel
        </TransitionLink>

        {/* Badge */}
        {comercio.badge && (
          <div className="absolute top-6 right-8">
            <div
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-white text-sm"
              style={{ background: 'var(--color-crimson)', fontFamily: 'var(--font-family-heading)' }}
            >
              <Tag size={13} aria-hidden="true" />
              {comercio.badge}
            </div>
          </div>
        )}

        {/* Name */}
        <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 pb-7">
          <p
            className="text-white/75 text-[10px] font-semibold uppercase tracking-widest mb-1"
            style={{ fontFamily: 'var(--font-family-heading)', letterSpacing: '0.12em' }}
          >
            {comercio.category}
          </p>
          <h1
            className="text-white font-bold leading-tight"
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: 'clamp(1.75rem, 3vw + 0.5rem, 3.25rem)',
              letterSpacing: '-0.01em',
            }}
          >
            {comercio.title}
          </h1>
        </div>
      </section>

      {/* Content */}
      <div className="px-5 sm:px-8 lg:px-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 py-10">

          {/* Left — info */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* Description */}
            <p
              className="text-base leading-relaxed"
              style={{
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-body)',
                lineHeight: '1.8',
                maxWidth: '65ch',
              }}
            >
              {comercio.description}
            </p>

            {/* Practical info */}
            <div
              className="rounded-2xl p-7 flex flex-col gap-5"
              style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
            >
              <h2
                className="text-sm font-bold uppercase tracking-widest"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-heading)', letterSpacing: '0.1em' }}
              >
                Información práctica
              </h2>
              <dl className="flex flex-col gap-3.5">
                {[
                  { Icon: MapPin, label: 'Dirección', value: comercio.address },
                  { Icon: Clock, label: 'Horario', value: comercio.hours },
                  { Icon: Phone, label: 'Teléfono', value: comercio.phone },
                  { Icon: Globe, label: 'Web', value: comercio.website },
                ].filter(row => !!row.value).map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'var(--color-crimson-light)' }}
                    >
                      <Icon size={15} weight="regular" aria-hidden="true" style={{ color: 'var(--color-crimson)' }} />
                    </div>
                    <div>
                      <dt className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-heading)' }}>
                        {label}
                      </dt>
                      <dd className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        {value}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Right — benefit card */}
          {comercio.benefit && (
          <div className="lg:col-span-1">
            <div
              className="sticky top-6 rounded-2xl overflow-hidden"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              {/* Benefit header */}
              <div
                className="px-7 py-6"
                style={{ background: 'var(--color-crimson)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={14} color="white" aria-hidden="true" />
                  <span
                    className="text-white/80 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ fontFamily: 'var(--font-family-heading)', letterSpacing: '0.12em' }}
                  >
                    Beneficio Real Travel
                  </span>
                </div>
                <p
                  className="text-white font-bold text-3xl leading-none"
                  style={{ fontFamily: 'var(--font-family-heading)', letterSpacing: '-0.03em' }}
                >
                  {comercio.badge}
                </p>
              </div>

              {/* Benefit body */}
              <div className="px-7 py-6 flex flex-col gap-5" style={{ background: 'var(--color-card)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)', lineHeight: '1.7' }}>
                  {comercio.benefit}
                </p>

                {/* Conditions */}
                <ul className="flex flex-col gap-2" aria-label="Condiciones del beneficio">
                  {(comercio.conditions ?? []).map(c => (
                    <li key={c} className="flex items-start gap-2">
                      <CheckCircle size={14} weight="regular" style={{ color: 'var(--color-crimson)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                      <span className="text-xs leading-snug" style={{ color: 'var(--color-text-muted)' }}>{c}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => setClaimed(true)}
                  disabled={claimed}
                  aria-pressed={claimed}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:cursor-default"
                  style={{
                    background: claimed ? 'var(--color-crimson-light)' : 'var(--color-crimson)',
                    color: claimed ? 'var(--color-crimson)' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-family-heading)',
                  }}
                >
                  {claimed
                    ? <><Check size={15} aria-hidden="true" /> Beneficio canjeado</>
                    : 'Canjear beneficio'
                  }
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </article>
  )
}
