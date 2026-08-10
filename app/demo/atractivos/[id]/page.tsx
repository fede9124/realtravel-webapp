'use client'

import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { RouteCard } from '@/components/ui/RouteCard'
import { ImageCarousel } from '@/components/ui/ImageCarousel'
import { Tabs, type TabItem } from '@/components/ui/Tabs'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import {
  ArrowLeft, ShareFat, MapPin, Star, NavigationArrow, ArrowSquareOut, Lightbulb,
  Headphones, Play, Pause, ArrowCounterClockwise,
} from '@phosphor-icons/react'
import { use } from 'react'
import { notFound } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { findLugar, LUGARES, RUTAS, routeCreatorComercio } from '@/lib/data'

const PinMapView = dynamic(() => import('@/components/map/PinMapView'), {
  ssr: false,
  loading: () => <div className="w-full h-full animate-pulse" style={{ background: 'var(--color-map-placeholder)' }} />,
})

const PV_LUGARES = LUGARES.filter(l => l.destinoId === 'puerto-varas')

const DETAIL_TABS: TabItem[] = [
  { id: 'descripcion', label: 'Descripción' },
  { id: 'mas-info', label: 'Más información' },
  { id: 'consejos', label: 'Consejos prácticos' },
  { id: 'audioguia', label: 'Audioguía' },
]

const WAVEFORM_HEIGHTS = [0.5, 0.8, 1, 0.6, 0.9, 0.7, 1, 0.5, 0.8, 0.6, 1, 0.7]
const CHARS_PER_SEC = 13.5
function fmt(secs: number) { const m = Math.floor(secs / 60); const s = Math.floor(secs % 60); return `${m}:${s.toString().padStart(2, '0')}` }

function AudioPlayer({ title, description }: { title: string; description: string }) {
  const [status, setStatus] = useState<'idle' | 'playing' | 'paused'>('idle')
  const [progress, setProgress] = useState(0)
  const startOffsetRef = useRef(0)
  const barRef = useRef<HTMLDivElement>(null)
  const audioText = `${title}. ${description}`
  const totalSecs = audioText.length / CHARS_PER_SEC
  const currentSecs = progress * totalSecs

  useEffect(() => () => { window.speechSynthesis?.cancel() }, [])

  function startFrom(offset: number) {
    window.speechSynthesis.cancel()
    startOffsetRef.current = offset
    const utt = new SpeechSynthesisUtterance(audioText.slice(offset))
    utt.lang = 'es'; utt.rate = 0.92
    utt.onboundary = e => setProgress((offset + e.charIndex) / audioText.length)
    utt.onend = () => { setStatus('idle'); setProgress(1) }
    utt.onerror = e => { if (e.error !== 'interrupted') setStatus('idle') }
    window.speechSynthesis.speak(utt); setStatus('playing'); setProgress(offset / audioText.length)
  }

  function handlePlayPause() {
    if (!window.speechSynthesis) return
    if (status === 'idle') { startFrom(Math.floor(progress * audioText.length)); return }
    if (status === 'paused') { window.speechSynthesis.resume(); setStatus('playing'); return }
    window.speechSynthesis.pause(); setStatus('paused')
  }

  function handleRestart() {
    if (!window.speechSynthesis) return
    startFrom(0)
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (!barRef.current) return
    const rect = barRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const offset = Math.floor(ratio * audioText.length)
    if (status !== 'idle') { startFrom(offset) } else { setProgress(ratio) }
  }

  const playing = status === 'playing'

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl p-6 flex flex-col gap-5" style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <Headphones size={15} weight="fill" style={{ color: 'var(--color-crimson)' }} aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Audioguía</span>
        </div>
        <div>
          <p className="font-semibold text-sm leading-snug" style={{ color: 'var(--color-text-primary)' }}>{title}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {playing ? 'Reproduciendo...' : status === 'paused' ? 'En pausa' : `${fmt(totalSecs)} · Español`}
          </p>
        </div>
        <div className="flex items-end justify-center gap-[3px]" aria-hidden="true" style={{ height: 28, opacity: playing ? 1 : 0.18, transition: 'opacity 0.4s ease' }}>
          {WAVEFORM_HEIGHTS.map((h, i) => (
            <span key={i} style={{ display: 'block', width: 3, borderRadius: 2, background: 'var(--color-crimson)', height: `${h * 100}%`, transformOrigin: 'bottom', animation: playing ? `audiobar 0.9s ease-in-out ${i * 0.07}s infinite alternate` : 'none' }} />
          ))}
        </div>
        <div className="flex flex-col gap-1">
          <div ref={barRef} role="slider" aria-label="Posición de reproducción" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}
            className="relative h-8 flex items-center cursor-pointer group" onClick={handleSeek}>
            <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--color-border)' }}>
              <div className="h-full rounded-full relative" style={{ width: `${progress * 100}%`, background: 'var(--color-crimson)', transition: playing ? 'none' : 'width 0.15s ease' }}>
                <div className="absolute right-0 top-1/2 w-3.5 h-3.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ transform: 'translate(50%, -50%)', background: 'var(--color-crimson)', border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
          </div>
          <div className="flex justify-between text-[11px]" style={{ color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
            <span>{fmt(currentSecs)}</span>
            <span>{fmt(totalSecs)}</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-8">
          <button onClick={handleRestart} aria-label="Reiniciar desde el principio"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90" style={{ color: 'var(--color-text-muted)' }}>
            <ArrowCounterClockwise size={24} weight="bold" aria-hidden="true" />
          </button>
          <button onClick={handlePlayPause} aria-label={playing ? 'Pausar' : 'Reproducir'}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--color-crimson)', color: 'white', boxShadow: '0 4px 16px color-mix(in srgb, var(--color-crimson) 35%, transparent)' }}>
            {playing ? <Pause size={26} weight="fill" aria-hidden="true" /> : <Play size={26} weight="fill" aria-hidden="true" style={{ marginLeft: 3 }} />}
          </button>
          <div className="w-10 h-10" aria-hidden="true" />
        </div>
      </div>
      <div className="rounded-xl p-5" style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Headphones size={13} weight="fill" style={{ color: 'var(--color-crimson)' }} aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Texto de la audioguía</span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
      </div>
    </div>
  )
}

export default function DemoLugarDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState('descripcion')
  const revealRef = useScrollReveal()

  const lugar = findLugar(id)
  if (!lugar || lugar.destinoId !== 'puerto-varas') notFound()

  const allImages = useMemo(() => {
    const imgs = [lugar.image]
    if (lugar.images?.length) imgs.push(...lugar.images)
    return imgs
  }, [lugar.image, lugar.images])

  const associatedRoutes = useMemo(() => RUTAS.filter(r => r.stops.includes(lugar.id) && r.destinoId === 'puerto-varas'), [lugar.id])
  const related = PV_LUGARES.filter(l => l.id !== lugar.id).slice(0, 4)

  const directionsUrl = lugar.lat && lugar.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${lugar.lat},${lugar.lng}`
    : null

  return (
    <div className="min-h-[100dvh]" style={{ background: 'var(--color-surface)' }}>
      <ImageCarousel images={allImages} alt={lugar.title} style={{ viewTransitionName: `card-${lugar.id}` } as React.CSSProperties}>
        <div className="absolute top-6 left-5 sm:left-8 z-10" style={{ zIndex: 3 }}>
          <TransitionLink href="/demo/atractivos" aria-label="Volver" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm text-sm font-medium transition-all hover:bg-white" style={{ color: 'var(--color-text-primary)' }}>
            <ArrowLeft size={16} aria-hidden="true" /> Atractivos
          </TransitionLink>
        </div>
        <div className="absolute top-6 right-5 sm:right-8 z-10" style={{ zIndex: 3 }}>
          <button onClick={() => navigator.share?.({ title: lugar.title, url: window.location.href })} aria-label="Compartir"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm text-sm font-medium transition-all hover:bg-white" style={{ color: 'var(--color-text-primary)' }}>
            <ShareFat size={16} weight="regular" aria-hidden="true" /> Compartir
          </button>
        </div>
      </ImageCarousel>

      <div className="px-5 sm:px-8 lg:px-12 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold mb-3"
                style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-heading)', letterSpacing: '-0.01em', textWrap: 'balance' } as React.CSSProperties}
              >
                {lugar.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full" style={{ color: 'var(--color-crimson)', background: 'var(--color-crimson-light)' }}>
                  {lugar.category}
                </span>
                <div className="flex items-center gap-1">
                  <MapPin size={13} style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{lugar.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={13} weight="fill" color="#FBBF24" />
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>{lugar.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div>
              <Tabs tabs={DETAIL_TABS} activeId={activeTab} onChange={setActiveTab} />

              <div className="mt-6 rounded-2xl p-6" style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}>
                {activeTab === 'descripcion' && (
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{lugar.description}</p>
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
                        <span className="block text-xs font-semibold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
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

                {activeTab === 'audioguia' && (
                  <AudioPlayer title={lugar.title} description={lugar.description} />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar — action card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 rounded-2xl p-7 flex flex-col gap-5" style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}>
              <h2 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>Acciones</h2>

              {directionsUrl && (
                <a href={directionsUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
                  style={{ background: 'var(--color-crimson)', color: 'white' }}>
                  <NavigationArrow size={18} weight="fill" aria-hidden="true" />
                  ¿Cómo llego?
                </a>
              )}

              {lugar.lat && lugar.lng ? (
                <div className="rounded-xl overflow-hidden" style={{ aspectRatio: '1/1', position: 'relative' }}>
                  <PinMapView lat={lugar.lat} lng={lugar.lng} title={lugar.title} />
                  <Link href="/demo/mapa"
                    className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
                    style={{ background: 'var(--color-card)', color: 'var(--color-text-primary)', boxShadow: 'var(--shadow-card)' }}>
                    <ArrowSquareOut size={12} aria-hidden="true" />
                    Abrir mapa
                  </Link>
                </div>
              ) : (
                <Link href="/demo/mapa"
                  className="rounded-xl overflow-hidden flex flex-col items-center justify-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ aspectRatio: '1/1', background: 'var(--color-map-placeholder)', color: 'var(--color-text-muted)' }}>
                  Ver en el mapa
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Associated routes — outside grid */}
        <div ref={revealRef}>
          {associatedRoutes.length > 0 && (
            <section aria-labelledby="heading-rutas" className="mt-14">
              <h2 id="heading-rutas" className="mb-7" style={{
                fontFamily: 'var(--font-family-display)', color: 'var(--color-text-primary)',
                fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', letterSpacing: '-0.01em', fontWeight: 600, lineHeight: 1.1,
              }}>
                Rutas que pasan por aquí
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 360px))', gap: '24px' }}>
                {associatedRoutes.map(r => {
                  const creator = routeCreatorComercio(r.id)
                  return <RouteCard key={r.id} {...r} href={`/demo/rutas/${r.id}`} createdBy={creator?.title ?? 'Puerto Varas'} />
                })}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section aria-labelledby="heading-relacionados" className="mt-14">
              <h2 id="heading-relacionados" className="mb-7" style={{
                fontFamily: 'var(--font-family-display)', color: 'var(--color-text-primary)',
                fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', letterSpacing: '-0.01em', fontWeight: 600, lineHeight: 1.1,
              }}>
                Más en Puerto Varas
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 320px))', gap: '20px' }}>
                {related.map(l => (
                  <Card key={l.id} {...l} href={`/demo/atractivos/${l.id}`} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
