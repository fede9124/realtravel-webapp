'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { CaretLeft, CaretRight, SquaresFour, X } from '@phosphor-icons/react'
import { ImageCarousel } from './ImageCarousel'

interface HeroGalleryProps {
  images: string[]
  alt: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

const MAX_TILES = 5

function gridFor(count: number): { columns: string; rows: string; areas: string[] } {
  switch (count) {
    case 1: return { columns: '1fr', rows: '1fr', areas: ['1 / 1 / 2 / 2'] }
    case 2: return { columns: '2fr 1fr', rows: '1fr', areas: ['1 / 1 / 2 / 2', '1 / 2 / 2 / 3'] }
    case 3: return {
      columns: '2fr 1fr', rows: '1fr 1fr',
      areas: ['1 / 1 / 3 / 2', '1 / 2 / 2 / 3', '2 / 2 / 3 / 3'],
    }
    case 4: return {
      columns: '2fr 1fr 1fr', rows: '1fr 1fr',
      areas: ['1 / 1 / 3 / 2', '1 / 2 / 2 / 4', '2 / 2 / 3 / 3', '2 / 3 / 3 / 4'],
    }
    default: return {
      columns: '2fr 1fr 1fr', rows: '1fr 1fr',
      areas: ['1 / 1 / 3 / 2', '1 / 2 / 2 / 3', '1 / 3 / 2 / 4', '2 / 2 / 3 / 3', '2 / 3 / 3 / 4'],
    }
  }
}

const hiRes = (src: string) => src.replace('w=600', 'w=1600')

export function HeroGallery({ images, alt, style, children }: HeroGalleryProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const tiles = images.slice(0, MAX_TILES)
  const grid = gridFor(tiles.length)

  return (
    <>
      {/* Mobile: carousel */}
      <div className="md:hidden">
        <ImageCarousel images={images} alt={alt} style={style}>
          {children}
        </ImageCarousel>
      </div>

      {/* Desktop: collage with constrained width */}
      <div className="hidden md:block px-4 lg:px-6 pt-6">
        <div className="relative mx-auto" style={{ maxWidth: '1536px' }}>
          <div
            className="grid gap-2 rounded-2xl overflow-hidden"
            style={{
              aspectRatio: '14 / 5',
              minHeight: '340px',
              gridTemplateColumns: grid.columns,
              gridTemplateRows: grid.rows,
            }}
          >
            {tiles.map((src, i) => (
              <button
                key={src}
                onClick={() => setLightboxIdx(i)}
                aria-label={`Ver foto ${i + 1} de ${images.length}`}
                className="group relative overflow-hidden cursor-zoom-in"
                style={{ gridArea: grid.areas[i], background: 'var(--color-border)', ...(i === 0 ? style : undefined) }}
              >
                <Image
                  src={hiRes(src)}
                  alt={i === 0 ? alt : `${alt} — foto ${i + 1}`}
                  fill
                  priority={i === 0}
                  loading={i === 0 ? undefined : 'eager'}
                  sizes={i === 0 ? '(min-width: 1200px) 800px, 66vw' : '(min-width: 1200px) 400px, 33vw'}
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span className="absolute inset-0 transition-colors duration-300 group-hover:bg-black/10" aria-hidden="true" />
              </button>
            ))}
          </div>

          <div className="absolute inset-x-0 top-0 h-28 rounded-t-2xl pointer-events-none bg-gradient-to-b from-black/35 to-transparent" style={{ zIndex: 2 }} aria-hidden="true" />
          {children}

          {images.length > 1 && (
            <button
              onClick={() => setLightboxIdx(0)}
              className="absolute bottom-4 right-4 flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-white/90 backdrop-blur-sm transition-all hover:bg-white active:scale-95"
              style={{ color: 'var(--color-text-primary)', zIndex: 3 }}
            >
              <SquaresFour size={16} aria-hidden="true" />
              Ver {images.length} fotos
            </button>
          )}
        </div>
      </div>

      {lightboxIdx !== null && (
        <Lightbox images={images} alt={alt} startIdx={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
    </>
  )
}

function Lightbox({ images, alt, startIdx, onClose }: { images: string[]; alt: string; startIdx: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIdx)
  const prev = () => setIdx(i => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setIdx(i => (i === images.length - 1 ? 0 : i + 1))

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIdx(i => (i === 0 ? images.length - 1 : i - 1))
      if (e.key === 'ArrowRight') setIdx(i => (i === images.length - 1 ? 0 : i + 1))
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [images.length, onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${alt}`}
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: 'rgba(10,6,4,0.92)', zIndex: 100 }}
      onClick={onClose}
    >
      <div className="relative" style={{ width: 'calc(100% - 128px)', maxWidth: '1152px', height: '85vh' }} onClick={e => e.stopPropagation()}>
        <Image src={hiRes(images[idx])} alt={`${alt} — foto ${idx + 1}`} fill sizes="90vw" className="object-contain" />
      </div>

      <button onClick={onClose} aria-label="Cerrar galería"
        className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25">
        <X size={18} weight="bold" aria-hidden="true" />
      </button>
      <p className="absolute top-7 left-1/2 -translate-x-1/2 text-sm text-white/80" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {idx + 1} / {images.length}
      </p>

      {images.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); prev() }} aria-label="Foto anterior"
            className="absolute left-5 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25">
            <CaretLeft size={20} weight="bold" aria-hidden="true" />
          </button>
          <button onClick={e => { e.stopPropagation(); next() }} aria-label="Foto siguiente"
            className="absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25">
            <CaretRight size={20} weight="bold" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  )
}
