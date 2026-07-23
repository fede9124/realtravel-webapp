'use client'

import {
  MapPin, Phone, EnvelopeSimple, Globe, Clock, InstagramLogo, FacebookLogo,
} from '@phosphor-icons/react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const CONTACT_INFO = [
  { icon: MapPin, label: 'Dirección', value: 'Del Salvador 320, Primer Piso, Puerto Varas', desc: 'Oficina de Información Turística' },
  { icon: Phone, label: 'Teléfono', value: '+56 65 236 1175' },
  { icon: EnvelopeSimple, label: 'Email', value: 'turismo@ptovaras.cl' },
  { icon: Globe, label: 'Sitio web', value: 'turismo.ptovaras.cl', href: 'https://turismo.ptovaras.cl' },
  { icon: Clock, label: 'Horario de atención', value: 'Lunes a Viernes: 9:00 – 18:00\nSábados y Domingos (verano): 10:00 – 14:00' },
]

const SOCIALS = [
  { icon: InstagramLogo, label: 'Instagram', handle: '@turismoptovaras', href: 'https://instagram.com/turismoptovaras' },
  { icon: FacebookLogo, label: 'Facebook', handle: 'Turismo Puerto Varas', href: 'https://facebook.com/turismoptovaras' },
]

const USEFUL = [
  { label: 'Emergencias', number: '131' },
  { label: 'Carabineros', number: '133' },
  { label: 'Bomberos', number: '132' },
  { label: 'SAMU (ambulancia)', number: '131' },
  { label: 'Información turística SERNATUR', number: '600 400 2020' },
]

export default function DemoContactoPage() {
  const revealRef = useScrollReveal()

  return (
    <div ref={revealRef} className="w-full pb-24">
      <div className="reveal px-5 sm:px-8 lg:px-12 pt-10 pb-8">
        <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-crimson)', letterSpacing: '0.1em', fontFamily: 'var(--font-family-body)' }}>
          Puerto Varas
        </p>
        <h1 className="font-bold mb-2" style={{ fontFamily: 'var(--font-family-display)', fontSize: 'clamp(24px, 4vw, 40px)', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          Contacto
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)', maxWidth: '520px' }}>
          Información de contacto de la Oficina de Turismo de Puerto Varas y datos útiles para tu visita.
        </p>
      </div>

      <div className="reveal px-5 sm:px-8 lg:px-12" style={{ maxWidth: '900px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {/* Contact info */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-bold uppercase" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
              Oficina de Turismo
            </h2>
            <div className="flex flex-col gap-3">
              {CONTACT_INFO.map(({ icon: Icon, label, value, desc, href }) => (
                <div key={label} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0" style={{ background: 'var(--color-crimson-light)' }}>
                    <Icon size={16} weight="fill" style={{ color: 'var(--color-crimson)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase block mb-0.5" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>
                      {label}
                    </span>
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-medium" style={{ color: 'var(--color-crimson)', textDecoration: 'none' }}>
                        {value}
                      </a>
                    ) : (
                      <span className="text-sm font-medium whitespace-pre-line" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
                    )}
                    {desc && <span className="text-xs block mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{desc}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <h2 className="text-sm font-bold uppercase mt-4" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
              Redes sociales
            </h2>
            <div className="flex gap-3">
              {SOCIALS.map(({ icon: Icon, label, handle, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-150 hover:scale-[1.02]"
                  style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', textDecoration: 'none', flex: 1 }}>
                  <Icon size={20} style={{ color: 'var(--color-text-muted)' }} />
                  <div>
                    <span className="text-sm font-medium block" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{handle}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Useful info */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-bold uppercase" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
              Números útiles
            </h2>
            <div className="flex flex-col gap-2">
              {USEFUL.map(({ label, number }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
                  <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
                  <span className="text-sm font-bold font-mono" style={{ color: 'var(--color-crimson)' }}>{number}</span>
                </div>
              ))}
            </div>

            <h2 className="text-sm font-bold uppercase mt-4" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
              Sobre Puerto Varas
            </h2>
            <div className="p-4 rounded-xl" style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Puerto Varas fue fundada por colonos alemanes en el siglo XIX y recibió el título de ciudad el 30 de octubre de 1897 (Decreto 4838), en honor a Antonio Varas de la Barra. Con 45.000 habitantes, es la puerta de entrada al Parque Nacional Vicente Pérez Rosales — el más antiguo de Chile — y a la Ruta de los Parques que recorre 2.800 km de Patagonia. A 28 km se encuentra Monte Verde, el sitio arqueológico más antiguo de América (18.500 años).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
