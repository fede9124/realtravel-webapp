'use client'

import { useEffect, useRef, useState } from 'react'
import { Info } from '@phosphor-icons/react'
import { LICENCIAS, type CreditoFoto } from '@/lib/data'

const linkProps = { target: '_blank', rel: 'noopener noreferrer' } as const

export function CreditLine({ credito, className = '' }: { credito: CreditoFoto; className?: string }) {
  return (
    <p
      className={`inline-flex max-w-full items-center gap-1 px-2 py-1 rounded-md text-[11px] leading-none text-white/90 truncate ${className}`}
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
    >
      <span className="truncate">
        Foto:{' '}
        <a href={credito.fuenteUrl} {...linkProps} className="font-medium text-white hover:underline">{credito.autor}</a>
        {' · '}
        <a href={LICENCIAS[credito.licencia]} {...linkProps} className="hover:underline">{credito.licencia}</a>
      </span>
    </p>
  )
}

export function CreditFull({ credito, tone = 'dark' }: { credito: CreditoFoto; tone?: 'dark' | 'light' }) {
  const strong = tone === 'light' ? 'text-white' : ''
  const strongStyle = tone === 'light' ? undefined : { color: 'var(--color-text-primary)' }
  return (
    <span>
      «<a href={credito.fuenteUrl} {...linkProps} className={`hover:underline ${strong}`} style={strongStyle}>{credito.titulo}</a>»
      {' de '}
      <a href={credito.autorUrl ?? credito.fuenteUrl} {...linkProps} className={`font-medium hover:underline ${strong}`} style={strongStyle}>{credito.autor}</a>
      {`, en ${credito.fuente}, bajo licencia `}
      <a href={LICENCIAS[credito.licencia]} {...linkProps} className={`hover:underline ${strong}`} style={strongStyle}>{credito.licencia}</a>
    </span>
  )
}

export function CreditInfoButton({ credito, className = '' }: { credito: CreditoFoto; className?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className={`absolute ${className}`} style={{ zIndex: 4 }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label={`Crédito de la foto: ${credito.autor}`}
        className="w-7 h-7 flex items-center justify-center rounded-full text-white transition-colors hover:bg-black/60"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      >
        <Info size={15} weight="bold" aria-hidden="true" />
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute bottom-full left-0 mb-2 w-64 p-3 rounded-xl text-xs leading-relaxed"
          style={{ background: 'var(--color-card)', color: 'var(--color-text-muted)', boxShadow: '0 12px 32px rgba(0,0,0,0.2)', border: '1px solid var(--color-border)' }}
        >
          <CreditFull credito={credito} />
        </div>
      )}
    </div>
  )
}
