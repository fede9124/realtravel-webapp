'use client'

import Image from 'next/image'
import { useState } from 'react'
import {
  MapPin, Mountains, Star, ArrowRight, Compass, Path, MapTrifold, Storefront, CalendarBlank,
  AirplaneTilt, Bus, Car,
} from '@phosphor-icons/react'
import { TransitionLink } from '@/components/ui/TransitionLink'
import { LUGARES, DESTINOS, RUTAS, COMERCIOS, EVENTOS } from '@/lib/data'

const DESTINO = DESTINOS.find(d => d.id === 'puerto-varas')!
const PV_LUGARES = LUGARES.filter(l => l.destinoId === 'puerto-varas')
const PV_RUTAS = RUTAS.filter(r => r.destinoId === 'puerto-varas')
const PV_COMERCIOS = COMERCIOS.filter(c => c.destinoId === 'puerto-varas')
const PV_EVENTOS = EVENTOS.filter(e => e.destinoId === 'puerto-varas')
const FEATURED = PV_LUGARES.filter(l => l.featured)
const TOP_RATED = [...PV_LUGARES].sort((a, b) => b.rating - a.rating).slice(0, 6)

const SECTIONS = [
  { Icon: Compass, label: 'Atractivos', count: PV_LUGARES.length, href: '/demo/atractivos', desc: 'Naturaleza, patrimonio y cultura' },
  { Icon: Path, label: 'Rutas', count: PV_RUTAS.length, href: '/demo/rutas', desc: 'Circuitos temáticos para recorrer' },
  { Icon: MapTrifold, label: 'Mapa', count: PV_LUGARES.length, href: '/demo/mapa', desc: 'Explorá todo en el mapa interactivo' },
  { Icon: Storefront, label: 'Servicios', count: PV_COMERCIOS.length, href: '/demo/servicios', desc: 'Alojamiento, gastronomía y más' },
  { Icon: CalendarBlank, label: 'Eventos', count: PV_EVENTOS.length, href: '/demo/eventos', desc: 'Actividades y festivales' },
]

function PlaceCard({ lugar }: { lugar: typeof PV_LUGARES[0] }) {
  const [imgErr, setImgErr] = useState(false)
  return (
    <TransitionLink href={`/demo/atractivos/${lugar.id}`} className="group block" style={{ textDecoration: 'none' }}>
      <div className="relative overflow-hidden rounded-xl" style={{ aspectRatio: '3/2', background: 'var(--color-border)' }}>
        {!imgErr ? (
          <Image src={lugar.image} alt={lugar.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw" onError={() => setImgErr(true)} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--color-map-placeholder)' }}>
            <Mountains size={28} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0" style={{ background: 'linear-gradient(to top, rgba(28,26,23,0.55) 0%, transparent 100%)', height: '50%' }} />
        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
          <span className="text-[10px] font-bold uppercase text-white" style={{ letterSpacing: '0.08em' }}>{lugar.category}</span>
          <span className="flex items-center gap-0.5">
            <Star size={10} weight="fill" color="#ffd54f" />
            <span className="text-[11px] font-semibold text-white">{lugar.rating.toFixed(1)}</span>
          </span>
        </div>
      </div>
      <div className="pt-3">
        <h3 className="font-bold leading-snug line-clamp-2 group-hover:underline" style={{ fontFamily: 'var(--font-family-display)', color: 'var(--color-text-primary)', fontSize: '16px', textUnderlineOffset: '3px', textDecorationThickness: '1.5px' }}>
          {lugar.title}
        </h3>
      </div>
    </TransitionLink>
  )
}

export default function DemoHomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-end" style={{ height: 'clamp(400px, 60vh, 620px)' }}>
        <Image src={DESTINO.image} alt="Puerto Varas" fill priority className="object-cover" style={{ zIndex: 0 }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(20,16,12,0.72) 0%, rgba(20,16,12,0.12) 55%, transparent 100%)', zIndex: 1 }} />
        <div className="relative flex flex-col items-center text-center pb-10 px-6" style={{ zIndex: 2, maxWidth: '680px' }}>
          <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.1em', border: '1px solid rgba(255,255,255,0.2)' }}>
            <MapPin size={11} weight="fill" />
            Los Lagos · Chile
          </div>
          <h1 className="text-white font-bold mb-3"
            style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(32px, 7vw, 64px)', letterSpacing: '-0.03em', lineHeight: 1.05, textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
            Puerto Varas
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 'clamp(14px, 2vw, 16px)', maxWidth: '500px', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
            {DESTINO.editorial.substring(0, 180)}…
          </p>
        </div>
      </section>

      {/* Quick access sections */}
      <section style={{ padding: '0 clamp(20px, 5vw, 80px)', marginTop: '-32px', position: 'relative', zIndex: 3 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'stretch' }}>
          {SECTIONS.map(({ Icon, label, count, href, desc }) => (
            <TransitionLink key={href} href={href} style={{ textDecoration: 'none', display: 'flex' }}>
              <div className="group flex flex-col gap-3 p-5 rounded-2xl transition-all duration-200 hover:scale-[1.02]"
                style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)', flex: 1 }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: 'var(--color-crimson-light)' }}>
                    <Icon size={18} weight="fill" style={{ color: 'var(--color-crimson)' }} />
                  </div>
                  <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-family-display)', color: 'var(--color-crimson)' }}>{count}</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm" style={{ fontFamily: 'var(--font-family-display)', color: 'var(--color-text-primary)' }}>{label}</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
                </div>
              </div>
            </TransitionLink>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section style={{ padding: 'clamp(48px, 6vw, 80px) clamp(20px, 5vw, 80px) 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
            <div>
              <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-crimson)', letterSpacing: '0.1em' }}>Destacados</p>
              <h2 className="font-bold" style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(22px, 3.5vw, 32px)', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                Imperdibles de Puerto Varas
              </h2>
            </div>
            <TransitionLink href="/demo/atractivos" className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--color-crimson)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Ver todos <ArrowRight size={14} weight="bold" />
            </TransitionLink>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 300px))', gap: '28px 20px' }}>
            {(FEATURED.length >= 3 ? FEATURED : TOP_RATED).map(l => <PlaceCard key={l.id} lugar={l} />)}
          </div>
        </div>
      </section>

      {/* About destination */}
      <section style={{ padding: 'clamp(48px, 6vw, 80px) clamp(20px, 5vw, 80px) 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', alignItems: 'center' }}>
            <div>
              <p className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--color-crimson)', letterSpacing: '0.1em' }}>Sobre el destino</p>
              <h2 className="font-bold mb-4" style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(22px, 3.5vw, 32px)', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                La puerta al sur de Chile
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>
                {DESTINO.editorial}
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                {Object.entries(DESTINO.facts).map(([key, val]) => (
                  <div key={key} className="px-3 py-2 rounded-xl" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                    <span className="text-[10px] font-bold uppercase block" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>
                      {key === 'epoca' ? 'Mejor época' : key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: '4/3', background: 'var(--color-border)' }}>
              <Image src={PV_LUGARES[1]?.image ?? DESTINO.image} alt="Volcán Osorno" fill className="object-cover" sizes="(min-width:768px) 50vw, 100vw" />
            </div>
          </div>
        </div>
      </section>

      {/* Cómo llegar */}
      <section style={{ padding: 'clamp(48px, 6vw, 80px) clamp(20px, 5vw, 80px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-crimson)', letterSpacing: '0.1em' }}>Accesos</p>
            <h2 className="font-bold" style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(22px, 3.5vw, 32px)', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
              Cómo llegar a Puerto Varas
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: '16px' }}>
            {/* Avión */}
            <div className="flex flex-col gap-4 p-6 rounded-2xl" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0" style={{ background: 'var(--color-crimson-light)' }}>
                  <AirplaneTilt size={20} weight="fill" style={{ color: 'var(--color-crimson)' }} />
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--color-text-primary)' }}>Avión</h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>~1h 30 min desde Santiago</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                El <strong style={{ color: 'var(--color-text-primary)' }}>Aeropuerto El Tepual</strong> está a 22 km de la ciudad, accesible por la ruta V-590. Desde el terminal hay taxis, transfers privados y rent a car disponibles.
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Aeropuerto+El+Tepual+Puerto+Montt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold mt-auto"
                style={{ color: 'var(--color-crimson)', textDecoration: 'none' }}
              >
                Ver aeropuerto <ArrowRight size={13} weight="bold" />
              </a>
            </div>

            {/* Bus */}
            <div className="flex flex-col gap-4 p-6 rounded-2xl" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0" style={{ background: 'var(--color-crimson-light)' }}>
                  <Bus size={20} weight="fill" style={{ color: 'var(--color-crimson)' }} />
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--color-text-primary)' }}>Bus</h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Servicio diario desde Santiago</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Salidas regulares durante todo el año con empresas como <strong style={{ color: 'var(--color-text-primary)' }}>Turbus, Cruz del Sur y Pullman Bus</strong>. El viaje dura aproximadamente 12 horas en buses cama o semi-cama.
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Terminal+de+Buses+Puerto+Varas"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold mt-auto"
                style={{ color: 'var(--color-crimson)', textDecoration: 'none' }}
              >
                Ver terminal <ArrowRight size={13} weight="bold" />
              </a>
            </div>

            {/* Auto */}
            <div className="flex flex-col gap-4 p-6 rounded-2xl" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0" style={{ background: 'var(--color-crimson-light)' }}>
                  <Car size={20} weight="fill" style={{ color: 'var(--color-crimson)' }} />
                </div>
                <div>
                  <h3 className="font-bold text-base" style={{ fontFamily: 'var(--font-family-heading)', color: 'var(--color-text-primary)' }}>Auto</h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>1.050 km desde Santiago</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Por la <strong style={{ color: 'var(--color-text-primary)' }}>Ruta 5 (Carretera Panamericana)</strong> hasta Puerto Montt y luego por la Ruta 225 hacia Puerto Varas. El recorrido toma aproximadamente 10 a 11 horas sin escalas.
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Puerto+Varas,Chile"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold mt-auto"
                style={{ color: 'var(--color-crimson)', textDecoration: 'none' }}
              >
                Ver ruta <ArrowRight size={13} weight="bold" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
