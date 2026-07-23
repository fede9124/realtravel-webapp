'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { ImageCarousel } from '@/components/ui/ImageCarousel'
import { Tabs } from '@/components/ui/Tabs'
import { useState, useMemo, use } from 'react'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, MapPin, Clock, Phone, Globe, Tag, Path, NavigationArrow,
  ShareFat, Star, InstagramLogo, FacebookLogo, TiktokLogo,
  WhatsappLogo, EnvelopeSimple,
} from '@phosphor-icons/react'
import { findComercio, findRuta, RUTAS } from '@/lib/data'

const PinMapView = dynamic(() => import('@/components/map/PinMapView'), { ssr: false })

function socialUrl(platform: string, handle: string): string {
  if (handle.startsWith('http')) return handle
  const clean = handle.replace(/^@/, '')
  if (platform === 'instagram') return `https://instagram.com/${clean}`
  if (platform === 'facebook') return `https://facebook.com/${clean}`
  if (platform === 'tiktok') return `https://tiktok.com/@${clean}`
  return '#'
}

export default function DemoServicioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState('info')

  const comercio = findComercio(id)
  if (!comercio || comercio.destinoId !== 'puerto-varas') notFound()

  const allImages = useMemo(() => {
    const imgs = [comercio.image]
    if (comercio.images?.length) imgs.push(...comercio.images)
    return imgs
  }, [comercio.image, comercio.images])

  const directionsUrl = comercio.lat && comercio.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${comercio.lat},${comercio.lng}`
    : null

  const hasSocial = comercio.instagram || comercio.facebook || comercio.tiktok
  const hasContact = comercio.whatsapp || comercio.email
  const hasHostStory = !!comercio.hostStory

  const linkedRoutes = RUTAS.filter(r => r.destinoId === 'puerto-varas' && comercio.rutaIds?.includes(r.id))

  const TABS = [
    { id: 'info', label: 'Información' },
    ...(hasHostStory ? [{ id: 'historia', label: 'Sobre el anfitrión' }] : []),
  ]
  const showTabs = TABS.length > 1

  return (
    <article className="min-h-screen pb-20" style={{ background: 'var(--color-surface)' }}>
      <ImageCarousel images={allImages} alt={comercio.title} height="clamp(280px, 40vh, 420px)"
        style={{ viewTransitionName: `card-${comercio.id}` } as React.CSSProperties}>
        <div className="absolute top-6 left-8 flex items-center gap-2" style={{ zIndex: 3 }}>
          <TransitionLink href="/demo/servicios" aria-label="Volver"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-white cursor-pointer transition-opacity hover:opacity-80"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
            <ArrowLeft size={15} /> Servicios
          </TransitionLink>
          <button onClick={() => navigator.share?.({ title: comercio.title, url: window.location.href })} aria-label="Compartir"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-white cursor-pointer transition-opacity hover:opacity-80"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
            <ShareFat size={15} /> Compartir
          </button>
        </div>
        {comercio.badge && (
          <div className="absolute top-6 right-8" style={{ zIndex: 3 }}>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-white text-sm"
              style={{ background: 'var(--color-crimson)', fontFamily: 'var(--font-family-heading)' }}>
              <Tag size={13} /> {comercio.badge}
            </div>
          </div>
        )}
        {comercio.logo && (
          <div className="absolute bottom-6 right-6" style={{ zIndex: 3 }}>
            <div className="rounded-2xl overflow-hidden shadow-lg" style={{ width: '72px', height: '72px', border: '3px solid white' }}>
              <img src={comercio.logo} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </ImageCarousel>

      <div className="px-5 sm:px-8 lg:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
                {comercio.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full"
                  style={{ color: 'var(--color-crimson)', background: 'var(--color-crimson-light)' }}>{comercio.category}</span>
                <div className="flex items-center gap-1">
                  <MapPin size={13} style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{comercio.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={13} weight="fill" color="#dca102" />
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{comercio.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {showTabs && <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />}

            {activeTab === 'info' && (
              <div className="flex flex-col gap-6">
                <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{comercio.description}</p>

                <div className="flex flex-col gap-2.5">
                  {[
                    { icon: MapPin, label: 'Dirección', value: comercio.address },
                    { icon: Clock, label: 'Horarios', value: comercio.hours },
                    ...(comercio.phone ? [{ icon: Phone, label: 'Teléfono', value: comercio.phone }] : []),
                    ...(comercio.website ? [{ icon: Globe, label: 'Web', value: comercio.website }] : []),
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                      <Icon size={15} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--color-crimson)' }} />
                      <div>
                        <span className="text-[10px] font-bold uppercase block" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>{label}</span>
                        <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {hasSocial && (
                  <div className="flex items-center gap-2">
                    {comercio.instagram && (
                      <a href={socialUrl('instagram', comercio.instagram)} target="_blank" rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                        <InstagramLogo size={18} />
                      </a>
                    )}
                    {comercio.facebook && (
                      <a href={socialUrl('facebook', comercio.facebook)} target="_blank" rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                        <FacebookLogo size={18} />
                      </a>
                    )}
                    {comercio.tiktok && (
                      <a href={socialUrl('tiktok', comercio.tiktok)} target="_blank" rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                        <TiktokLogo size={18} />
                      </a>
                    )}
                  </div>
                )}

                {linkedRoutes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold mb-3" style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--color-text-primary)' }}>Rutas vinculadas</h3>
                    <div className="flex flex-col gap-2">
                      {linkedRoutes.map(r => (
                        <Link key={r.id} href={`/demo/rutas/${r.id}`}
                          className="flex items-center gap-2 p-3 rounded-xl transition-colors hover:bg-[var(--color-surface)]"
                          style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', textDecoration: 'none' }}>
                          <Path size={14} style={{ color: 'var(--color-crimson)' }} />
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{r.title}</span>
                          <span className="text-xs ml-auto" style={{ color: 'var(--color-text-muted)' }}>{r.difficulty}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'historia' && comercio.hostStory && (
              <div className="p-6 rounded-2xl" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{comercio.hostStory}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-[88px] lg:self-start">
            {comercio.lat && comercio.lng && (
              <div className="rounded-2xl overflow-hidden" style={{ height: '200px', border: '1px solid var(--color-border)' }}>
                <PinMapView lat={comercio.lat} lng={comercio.lng} title={comercio.title} />
              </div>
            )}

            {directionsUrl && (
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-150 hover:scale-[1.02] active:scale-95"
                style={{ background: 'var(--color-crimson)', color: 'white', textDecoration: 'none', boxShadow: 'var(--shadow-fab)' }}>
                <NavigationArrow size={15} weight="fill" /> Cómo llegar
              </a>
            )}

            {hasContact && (
              <div className="p-4 rounded-2xl flex flex-col gap-3" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                <h3 className="text-sm font-bold" style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--color-text-primary)' }}>Contacto</h3>
                <div className="flex flex-col gap-2">
                  {comercio.whatsapp && (
                    <a href={`https://wa.me/${comercio.whatsapp}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                      style={{ background: '#25D366', textDecoration: 'none' }}>
                      <WhatsappLogo size={16} weight="fill" /> WhatsApp
                    </a>
                  )}
                  {comercio.email && (
                    <a href={`mailto:${comercio.email}`}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                      style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', textDecoration: 'none' }}>
                      <EnvelopeSimple size={16} /> Email
                    </a>
                  )}
                </div>
              </div>
            )}

            {comercio.benefit && (
              <div className="p-4 rounded-2xl" style={{ background: 'var(--color-crimson-light)', border: '1px solid rgba(196,18,48,0.15)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={14} style={{ color: 'var(--color-crimson)' }} />
                  <span className="text-sm font-bold" style={{ color: 'var(--color-crimson)' }}>Beneficio</span>
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{comercio.benefit}</p>
                {comercio.conditions && (
                  <ul className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {comercio.conditions.map(c => <li key={c}>· {c}</li>)}
                  </ul>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </article>
  )
}
