'use client'

import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { ImageCarousel } from '@/components/ui/ImageCarousel'
import { Tabs } from '@/components/ui/Tabs'
import { useState, useMemo, use } from 'react'

const PinMapView = dynamic(() => import('@/components/map/PinMapView'), { ssr: false })
import { notFound } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, MapPin, Clock, Phone, Globe, Tag, CheckCircle, Check, Path,
  BookmarkSimple, Heart, InstagramLogo, FacebookLogo, TiktokLogo,
  WhatsappLogo, EnvelopeSimple, FilePdf, DownloadSimple,
} from '@phosphor-icons/react'
import { findComercio, findRuta } from '@/lib/data'
import { useFavorites } from '@/hooks/useFavorites'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { LoginPrompt } from '@/components/ui/LoginPrompt'

function youtubeId(url: string): string {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/)
  return match ? match[1] : url
}

function socialUrl(platform: string, handle: string): string {
  if (handle.startsWith('http')) return handle
  const clean = handle.replace(/^@/, '')
  if (platform === 'instagram') return `https://instagram.com/${clean}`
  if (platform === 'facebook') return `https://facebook.com/${clean}`
  if (platform === 'tiktok') return `https://tiktok.com/@${clean}`
  return '#'
}

export default function ComercioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [claimed, setClaimed] = useState(false)
  const [liked, setLiked] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const { favorites, toggleFavorite } = useFavorites()
  const { showLogin, loginMessage, requireAuth, closeLogin } = useRequireAuth()

  const comercio = findComercio(id)
  if (!comercio) notFound()

  const saved = favorites.has(comercio.id)

  const allImages = useMemo(() => {
    const imgs = [comercio.image]
    if (comercio.images?.length) imgs.push(...comercio.images)
    return imgs
  }, [comercio.image, comercio.images])

  const hasSocial = comercio.instagram || comercio.facebook || comercio.tiktok
  const hasContact = comercio.whatsapp || comercio.email
  const hasHostStory = !!comercio.hostStory

  const TABS = hasHostStory
    ? [{ id: 'info', label: 'Información' }, { id: 'historia', label: 'Sobre el anfitrión' }]
    : []

  return (
    <article className="min-h-screen pb-20" style={{ background: 'var(--color-surface)' }}>

      {/* Hero carousel */}
      <ImageCarousel
        images={allImages}
        alt={comercio.title}
        height="clamp(280px, 40vh, 420px)"
        style={{ viewTransitionName: `card-${comercio.id}` } as React.CSSProperties}
      >
        {/* Back button */}
        <TransitionLink
          href="/red-travel"
          aria-label="Volver a Red Travel"
          className="absolute top-6 left-8 flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-white cursor-pointer transition-opacity hover:opacity-80"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', zIndex: 3 }}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Red Travel
        </TransitionLink>

        {/* Badge */}
        {comercio.badge && (
          <div className="absolute top-6 right-8" style={{ zIndex: 3 }}>
            <div
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-white text-sm"
              style={{ background: 'var(--color-crimson)', fontFamily: 'var(--font-family-heading)' }}
            >
              <Tag size={13} aria-hidden="true" />
              {comercio.badge}
            </div>
          </div>
        )}

        {/* Name overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 pb-7"
          style={{ zIndex: 3, paddingRight: comercio.logo ? '160px' : undefined }}
        >
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

        {/* Logo — right side, fully over the carousel */}
        {comercio.logo && (
          <div
            className="absolute overflow-hidden"
            style={{
              width: 'clamp(56px, 9vw, 160px)',
              height: 'clamp(56px, 9vw, 160px)',
              borderRadius: '50%',
              border: '4px solid white',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              bottom: 'clamp(14px, 2.5vw, 32px)',
              right: 'clamp(20px, 10vw, 160px)',
              zIndex: 10,
              background: 'white',
            }}
          >
            <Image
              src={comercio.logo}
              alt={`Logo de ${comercio.title}`}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 128px, 72px"
            />
          </div>
        )}
      </ImageCarousel>

      {/* Content */}
      <div className="px-5 sm:px-8 lg:px-12 w-full">
        <div className={`grid grid-cols-1 ${comercio.benefit ? 'lg:grid-cols-3' : ''} gap-10 py-10`}>

          {/* Left — info */}
          <div className={`${comercio.benefit ? 'lg:col-span-2' : ''} flex flex-col gap-8`}>

            {/* Tabs (only if host story exists) */}
            {hasHostStory && (
              <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />
            )}

            {activeTab === 'info' ? (
              <>
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
                      { Icon: MapPin, label: 'Dirección', value: comercio.address, href: undefined as string | undefined },
                      { Icon: Clock, label: 'Horario', value: comercio.hours, href: undefined as string | undefined },
                      { Icon: Phone, label: 'Teléfono', value: comercio.phone, href: undefined as string | undefined },
                      { Icon: Globe, label: 'Web', value: comercio.website, href: comercio.website ? `https://${comercio.website.replace(/^https?:\/\//, '')}` : undefined },
                    ].filter(row => !!row.value).map(({ Icon, label, value, href }) => (
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
                            {href ? (
                              <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-crimson)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                                {value}
                              </a>
                            ) : value}
                          </dd>
                        </div>
                      </div>
                    ))}
                  </dl>

                  {/* Social media icons */}
                  {hasSocial && (
                    <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                      {comercio.instagram && (
                        <a
                          href={socialUrl('instagram', comercio.instagram)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Instagram"
                          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                          style={{ background: 'var(--color-crimson-light)', color: 'var(--color-crimson)' }}
                        >
                          <InstagramLogo size={18} weight="regular" />
                        </a>
                      )}
                      {comercio.facebook && (
                        <a
                          href={socialUrl('facebook', comercio.facebook)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Facebook"
                          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                          style={{ background: 'var(--color-crimson-light)', color: 'var(--color-crimson)' }}
                        >
                          <FacebookLogo size={18} weight="regular" />
                        </a>
                      )}
                      {comercio.tiktok && (
                        <a
                          href={socialUrl('tiktok', comercio.tiktok)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="TikTok"
                          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                          style={{ background: 'var(--color-crimson-light)', color: 'var(--color-crimson)' }}
                        >
                          <TiktokLogo size={18} weight="regular" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Video de YouTube */}
                {comercio.youtubeUrl && (
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
                  >
                    <div style={{ aspectRatio: '16/9', position: 'relative' }}>
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${youtubeId(comercio.youtubeUrl)}`}
                        title={`Video de ${comercio.title}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                        className="absolute inset-0 w-full h-full"
                        style={{ border: 'none' }}
                      />
                    </div>
                  </div>
                )}

                {/* Documentos PDF */}
                {comercio.pdfs && comercio.pdfs.length > 0 && (
                  <div
                    className="rounded-2xl p-7 flex flex-col gap-4"
                    style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
                  >
                    <h2
                      className="text-sm font-bold uppercase tracking-widest"
                      style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-heading)', letterSpacing: '0.1em' }}
                    >
                      Documentos
                    </h2>
                    <div className="flex flex-col gap-2.5">
                      {comercio.pdfs.map(pdf => (
                        <a
                          key={pdf.url}
                          href={pdf.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3.5 rounded-xl transition-colors hover:opacity-80"
                          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                        >
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'var(--color-crimson-light)' }}
                          >
                            <FilePdf size={17} weight="regular" style={{ color: 'var(--color-crimson)' }} aria-hidden="true" />
                          </div>
                          <span className="flex-1 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {pdf.title}
                          </span>
                          <DownloadSimple size={16} aria-hidden="true" style={{ color: 'var(--color-text-muted)' }} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Host story tab */
              <div
                className="rounded-2xl p-7"
                style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
              >
                <h2
                  className="text-sm font-bold uppercase tracking-widest mb-4"
                  style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-heading)', letterSpacing: '0.1em' }}
                >
                  Sobre el anfitrión
                </h2>
                <p
                  className="text-base leading-relaxed"
                  style={{
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-family-body)',
                    lineHeight: '1.8',
                    maxWidth: '65ch',
                  }}
                >
                  {comercio.hostStory}
                </p>
              </div>
            )}
          </div>

          {/* Right — benefit card + action box + contact */}
          {comercio.benefit && (
            <div className="lg:col-span-1">
              <div className="sticky top-6 flex flex-col gap-5">

                {/* Benefit card */}
                <div className="rounded-2xl overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <div className="px-7 py-6" style={{ background: 'var(--color-crimson)' }}>
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
                  <div className="px-7 py-6 flex flex-col gap-5" style={{ background: 'var(--color-card)' }}>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)', lineHeight: '1.7' }}>
                      {comercio.benefit}
                    </p>
                    <ul className="flex flex-col gap-2" aria-label="Condiciones del beneficio">
                      {(comercio.conditions ?? []).map(c => (
                        <li key={c} className="flex items-start gap-2">
                          <CheckCircle size={14} weight="regular" style={{ color: 'var(--color-crimson)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                          <span className="text-xs leading-snug" style={{ color: 'var(--color-text-muted)' }}>{c}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => { if (requireAuth('Iniciá sesión para canjear beneficios')) setClaimed(true) }}
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

                {/* Action box */}
                <div
                  className="rounded-2xl p-5 flex flex-col gap-4"
                  style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
                >
                  <p
                    className="text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-heading)', letterSpacing: '0.1em' }}
                  >
                    Acciones
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { if (requireAuth('Iniciá sesión para guardar comercios')) toggleFavorite(comercio.id) }}
                      aria-pressed={saved}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer"
                      style={{
                        background: saved ? 'var(--color-crimson)' : 'var(--color-surface)',
                        color: saved ? 'white' : 'var(--color-text-primary)',
                        border: saved ? 'none' : '1px solid var(--color-border)',
                        fontFamily: 'var(--font-family-heading)',
                      }}
                    >
                      <BookmarkSimple size={15} weight={saved ? 'fill' : 'regular'} aria-hidden="true" />
                      {saved ? 'Guardado' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => setLiked(p => !p)}
                      aria-pressed={liked}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 cursor-pointer"
                      style={{
                        background: liked ? '#FEE2E2' : 'var(--color-surface)',
                        color: liked ? '#DC2626' : 'var(--color-text-primary)',
                        border: liked ? 'none' : '1px solid var(--color-border)',
                        fontFamily: 'var(--font-family-heading)',
                      }}
                    >
                      <Heart size={15} weight={liked ? 'fill' : 'regular'} aria-hidden="true" />
                      {liked ? 'Te gusta' : 'Me gusta'}
                    </button>
                  </div>
                </div>

                {/* Contact card */}
                {hasContact && (
                  <div
                    className="rounded-2xl p-5 flex flex-col gap-3"
                    style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
                  >
                    <p
                      className="text-[10px] font-semibold uppercase tracking-widest"
                      style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-heading)', letterSpacing: '0.1em' }}
                    >
                      Contacto
                    </p>
                    {comercio.whatsapp && (
                      <a
                        href={`https://wa.me/${comercio.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white transition-all active:scale-95"
                        style={{ background: '#25D366', fontFamily: 'var(--font-family-heading)' }}
                      >
                        <WhatsappLogo size={18} weight="fill" />
                        WhatsApp
                      </a>
                    )}
                    {comercio.email && (
                      <a
                        href={`mailto:${comercio.email}`}
                        className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
                        style={{
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)',
                          fontFamily: 'var(--font-family-heading)',
                        }}
                      >
                        <EnvelopeSimple size={18} />
                        Email
                      </a>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mapa de ubicación */}
      {comercio.lat && comercio.lng && (
        <div className="px-5 sm:px-8 lg:px-12 pb-12">
          <h2
            className="text-sm font-bold uppercase tracking-widest mb-5"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-heading)', letterSpacing: '0.1em' }}
          >
            Ubicación
          </h2>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ height: 'clamp(220px, 35vw, 360px)', boxShadow: 'var(--shadow-card)' }}
          >
            <PinMapView lat={comercio.lat} lng={comercio.lng} title={comercio.title} />
          </div>
          <p className="mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {comercio.address}
          </p>
        </div>
      )}

      {/* Rutas vinculadas */}
      {comercio.rutaIds && comercio.rutaIds.length > 0 && (
        <div className="px-5 sm:px-8 lg:px-12 pb-16">
          <h2
            className="text-sm font-bold uppercase tracking-widest mb-6"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-heading)', letterSpacing: '0.1em' }}
          >
            Rutas propias
          </h2>
          <div className="flex flex-wrap gap-4">
            {comercio.rutaIds.map(rid => {
              const ruta = findRuta(rid)
              if (!ruta) return null
              return (
                <Link
                  key={rid}
                  href={`/rutas/${ruta.id}`}
                  className="flex items-center gap-4 p-5 rounded-2xl transition-all hover:shadow-md"
                  style={{
                    background: 'var(--color-card)',
                    boxShadow: 'var(--shadow-card)',
                    textDecoration: 'none',
                    flex: '1 0 280px',
                    maxWidth: '400px',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--color-crimson-light)' }}
                  >
                    <Path size={20} weight="regular" style={{ color: 'var(--color-crimson)' }} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-sm leading-snug truncate mb-1"
                      style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-family-display)' }}
                    >
                      {ruta.title}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {ruta.duration} · {ruta.stops.length} paradas · {ruta.distance}
                    </p>
                  </div>
                  <ArrowRight
                    size={15}
                    weight="bold"
                    style={{ color: 'var(--color-crimson)', flexShrink: 0 }}
                    aria-hidden="true"
                  />
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <LoginPrompt open={showLogin} onClose={closeLogin} message={loginMessage} />
    </article>
  )
}
