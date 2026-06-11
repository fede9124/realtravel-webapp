import Link from 'next/link'
import { CloudSlash } from '@phosphor-icons/react/dist/ssr'

export const metadata = {
  title: 'Sin conexión — Real Travel',
}

export default function OfflinePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-6 px-5 text-center">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--color-crimson-light)' }}
      >
        <CloudSlash size={38} weight="regular" style={{ color: 'var(--color-crimson)' }} aria-hidden="true" />
      </div>

      <div className="max-w-md">
        <p
          className="text-sm font-bold uppercase mb-2"
          style={{ color: 'var(--color-crimson)', fontFamily: 'var(--font-family-body)', letterSpacing: '0.12em' }}
        >
          Sin conexión
        </p>
        <h1
          className="font-bold mb-3"
          style={{
            fontFamily: 'var(--font-family-display)',
            color: 'var(--color-text-primary)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            letterSpacing: '-0.015em',
            lineHeight: 1.05,
          }}
        >
          El viaje continúa sin señal
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          No hay conexión a internet en este momento. Las páginas que ya visitaste
          siguen disponibles; el resto te espera cuando vuelvas a tener red.
        </p>
      </div>

      <Link
        href="/explorar"
        className="px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
        style={{ background: 'var(--color-crimson)' }}
      >
        Reintentar
      </Link>
    </div>
  )
}
