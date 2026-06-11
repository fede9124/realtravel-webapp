import { CloudArrowDown, GearSix, Gavel, Eye, SignOut, CaretRight, Sun, MapPin } from '@phosphor-icons/react/dist/ssr'
import { StatsGrid } from '@/components/perfil/StatsGrid'

const MENU_ITEMS = [
  { icon: CloudArrowDown, label: 'Descargados', description: '3 lugares disponibles offline', href: '/perfil/descargados' },
  { icon: GearSix, label: 'Idioma', description: 'Español (Chile)', href: '/perfil/idioma' },
  { icon: Gavel, label: 'Legal', description: 'Términos, privacidad y licencias', href: '/perfil/legal' },
  { icon: Eye, label: 'Accesibilidad no vidente', description: 'Activar modo lector de pantalla', href: '/perfil/accesibilidad' },
]

export default function PerfilPage() {
  return (
    <div className="px-5 sm:px-8 lg:px-12 pt-14 pb-24 w-full max-w-5xl">
      <div className="mb-10">
        <h1
          style={{
            fontFamily: 'var(--font-family-display)',
            color: 'var(--color-text-primary)',
            fontSize: 'clamp(3.5rem, 6vw, 6.5rem)',
            letterSpacing: '-0.02em',
            lineHeight: 0.95,
            fontWeight: 600,
          }}
        >
          Mi Perfil
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left — user card */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          {/* Profile card */}
          <div
            className="rounded-2xl p-7 text-white"
            style={{ background: 'linear-gradient(135deg, var(--color-crimson) 0%, var(--color-crimson-hover) 100%)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold select-none">
                V
              </div>
              <div
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{ background: 'rgba(255,255,255,0.2)' }}
                aria-label="Clima local: soleado, 22°C"
              >
                <Sun size={14} aria-hidden="true" />
                <span className="text-sm font-semibold">22°C</span>
              </div>
            </div>

            <h2 className="font-bold text-xl leading-tight">Viajero Aventurero</h2>
            <p className="text-white/75 text-sm mt-0.5 mb-4">viajero@realtravel.com</p>

            <div className="flex items-center gap-1.5 text-white/80 text-sm">
              <MapPin size={13} aria-hidden="true" />
              <span>Madrid, España</span>
            </div>
          </div>

          {/* Stats grid — guardados lee favoritos reales */}
          <StatsGrid />
        </div>

        {/* Right — settings menu */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-muted)' }}>
            Configuración
          </h2>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
          >
            {MENU_ITEMS.map(({ icon: Icon, label, description, href }, index) => (
              <a
                key={label}
                href={href}
                className="flex items-center gap-4 px-6 py-[18px] transition-colors hover-surface"
                style={{
                  borderBottom: index < MENU_ITEMS.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
                aria-label={label}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--color-crimson-light)' }}
                >
                  <Icon size={18} weight="regular" aria-hidden="true" style={{ color: 'var(--color-crimson)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {label}
                  </p>
                  {description && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {description}
                    </p>
                  )}
                </div>
                <CaretRight size={16} weight="regular" aria-hidden="true" style={{ color: 'var(--color-text-muted)' }} />
              </a>
            ))}
          </div>

          {/* Logout */}
          <button
            className="flex items-center gap-4 w-full px-6 py-[18px] rounded-2xl transition-colors hover-crimson-light"
            style={{ background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}
            aria-label="Cerrar sesión"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-crimson-light)' }}
            >
              <SignOut size={18} weight="regular" aria-hidden="true" style={{ color: 'var(--color-crimson)' }} />
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--color-crimson)' }}>
              Cerrar sesión
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
