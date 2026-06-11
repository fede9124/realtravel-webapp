import Link from 'next/link'
import { Compass } from '@phosphor-icons/react/dist/ssr'

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-6 px-5 text-center">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--color-crimson-light)' }}
      >
        <Compass size={38} weight="regular" style={{ color: 'var(--color-crimson)' }} aria-hidden="true" />
      </div>

      <div className="max-w-md">
        <p
          className="text-sm font-bold uppercase mb-2"
          style={{ color: 'var(--color-crimson)', fontFamily: 'var(--font-family-heading)', letterSpacing: '0.12em' }}
        >
          Error 404
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
          Este lugar no está en el mapa
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          La página que buscas no existe o fue movida. Los mejores descubrimientos empiezan volviendo al inicio.
        </p>
      </div>

      <Link
        href="/explorar"
        className="px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
        style={{ background: 'var(--color-crimson)' }}
      >
        Volver a Explorar
      </Link>
    </div>
  )
}
