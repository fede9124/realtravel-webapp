'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { RouteCard } from '@/components/ui/RouteCard'
import { ImageCarousel } from '@/components/ui/ImageCarousel'
import { Tabs, type TabItem } from '@/components/ui/Tabs'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import {
  ArrowLeft, ShareFat, MapPin, Star, NavigationArrow,
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
    if (status === 'idle') { startFrom(0); return }
    if (status === 'playing') { window.speechSynthesis.pause(); setStatus('paused'); return }
    window.speechSynthesis.resume(); setStatus('playing')
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (!barRef.current) return
    const rect = barRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const charOffset = Math.floor(pct * audioText.length)
    startFrom(charOffset)
  }

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: 'var(--color-crimson-light)' }}>
          <Headphones size={18} weight="fill" style={{ color: 'var(--color-crimson)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-heading)' }}>Audioguía</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{fmt(totalSecs)} · Español</p>
        </div>
      </div>
      <div className="flex items-center gap-2 h-10">
        {WAVEFORM_HEIGHTS.map((h, i) => {
          const filled = progress > i / WAVEFORM_HEIGHTS.length
          return (<div key={i} className="flex-1 rounded-full" style={{
            height: `${h * 100}%`, background: filled ? 'var(--color-crimson)' : 'var(--color-border)',
            animation: status === 'playing' ? `audiobar 0.${4 + (i % 4)}s ease-in-out ${i * 0.05}s infinite alternate` : 'none',
            transition: 'background 0.2s ease',
          }} />)
        })}
      </div>
      <div ref={barRef} className="relative h-1.5 rounded-full cursor-pointer" style={{ background: 'var(--color-border)' }} onClick={handleSeek}>
        <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${progress * 100}%`, background: 'var(--color-crimson)', transition: 'width 0.1s linear' }} />
        <div className="absolute top-1/2 w-3.5 h-3.5 rounded-full -translate-y-1/2 -translate-x-1/2 border-2 border-white" style={{ left: `${progress * 100}%`, background: 'var(--color-crimson)', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono tabular-nums" style={{ color: 'var(--color-text-muted)' }}>{fmt(currentSecs)}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => startFrom(0)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface)' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
            <ArrowCounterClockwise size={15} />
          </button>
          <button onClick={handlePlayPause} className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-150 active:scale-90"
            style={{ background: 'var(--color-crimson)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-fab)' }}>
            {status === 'playing' ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
          </button>
        </div>
        <span className="text-[11px] font-mono tabular-nums" style={{ color: 'var(--color-text-muted)' }}>{fmt(totalSecs)}</span>
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
    <div ref={revealRef} className="min-h-[100dvh]" style={{ background: 'var(--color-surface)' }}>
      <ImageCarousel images={allImages} alt={lugar.title} style={{ viewTransitionName: `card-${lugar.id}` } as React.CSSProperties}>
        <div className="absolute top-6 left-5 sm:left-8 z-10" style={{ zIndex: 3 }}>
          <TransitionLink href="/demo/atractivos" aria-label="Volver" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm text-sm font-medium transition-all hover:bg-white" style={{ color: 'var(--color-text-primary)' }}>
            <ArrowLeft size={16} /> Atractivos
          </TransitionLink>
        </div>
        <div className="absolute top-6 right-5 sm:right-8 z-10" style={{ zIndex: 3 }}>
          <button onClick={() => navigator.share?.({ title: lugar.title, url: window.location.href })} aria-label="Compartir"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm text-sm font-medium transition-all hover:bg-white" style={{ color: 'var(--color-text-primary)' }}>
            <ShareFat size={16} /> Compartir
          </button>
        </div>
      </ImageCarousel>

      <div className="px-5 sm:px-8 lg:px-12 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-heading)', letterSpacing: '-0.01em' }}>
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
                  <Star size={13} weight="fill" color="#dca102" />
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{lugar.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <Tabs tabs={DETAIL_TABS} activeId={activeTab} onChange={setActiveTab} />

            {activeTab === 'descripcion' && (
              <div className="reveal">
                <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{lugar.description}</p>
              </div>
            )}

            {activeTab === 'mas-info' && (
              <div className="reveal flex flex-col gap-4">
                <div className="flex flex-col gap-2.5">
                  {[{ label: 'Horarios', value: lugar.hours }, { label: 'Entrada', value: lugar.entry }].map(({ label, value }) => (
                    <div key={label} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                      <span className="text-xs font-bold uppercase shrink-0 mt-0.5" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.06em', width: '72px' }}>{label}</span>
                      <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'audioguia' && (
              <div className="reveal">
                <AudioPlayer title={lugar.title} description={lugar.description} />
              </div>
            )}

            {/* Associated routes */}
            {associatedRoutes.length > 0 && (
              <div className="reveal flex flex-col gap-4 mt-4">
                <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--color-text-primary)' }}>
                  Rutas que pasan por aquí
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 420px))', gap: '20px' }}>
                  {associatedRoutes.map(r => {
                    const creator = routeCreatorComercio(r.id)
                    return (<RouteCard key={r.id} {...r} href={`/demo/rutas/${r.id}`} createdBy={creator?.title ?? 'Puerto Varas'} />)
                  })}
                </div>
              </div>
            )}

            {/* Related */}
            {related.length > 0 && (
              <div className="reveal flex flex-col gap-4 mt-4">
                <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--color-text-primary)' }}>
                  Más en Puerto Varas
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 260px))', gap: '20px' }}>
                  {related.map(l => (
                    <Card key={l.id} id={l.id} image={l.image} category={l.category} title={l.title} location={l.location} rating={l.rating} href={`/demo/atractivos/${l.id}`} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-[88px] lg:self-start">
            {/* Map */}
            {lugar.lat && lugar.lng && (
              <div className="rounded-2xl overflow-hidden" style={{ height: '240px', border: '1px solid var(--color-border)' }}>
                <PinMapView lat={lugar.lat} lng={lugar.lng} title={lugar.title} />
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
              <div className="flex flex-col gap-2 text-sm">
                <div><span style={{ color: 'var(--color-text-muted)' }}>Horarios:</span> <span style={{ color: 'var(--color-text-primary)' }}>{lugar.hours}</span></div>
                <div><span style={{ color: 'var(--color-text-muted)' }}>Entrada:</span> <span style={{ color: 'var(--color-text-primary)' }}>{lugar.entry}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
