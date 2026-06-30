'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'

interface ImageCarouselProps {
  images: string[]
  alt: string
  height?: string
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export function ImageCarousel({
  images,
  alt,
  height = 'clamp(280px, 45vw, 440px)',
  className = '',
  style,
  children,
}: ImageCarouselProps) {
  const [idx, setIdx] = useState(0)

  const prev = () => setIdx(i => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setIdx(i => (i === images.length - 1 ? 0 : i + 1))

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height, ...style }}
    >
      {images.map((src, i) => (
        <Image
          key={src}
          src={src.replace('w=600', 'w=1200')}
          alt={i === 0 ? alt : `${alt} — foto ${i + 1}`}
          fill
          priority={i === 0}
          className="object-cover transition-opacity duration-500"
          sizes="100vw"
          style={{ opacity: i === idx ? 1 : 0, zIndex: i === idx ? 1 : 0 }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30" style={{ zIndex: 2 }} />

      {children}

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Imagen anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all hover:bg-white active:scale-95"
            style={{ zIndex: 3 }}
          >
            <CaretLeft size={18} weight="bold" style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <button
            onClick={next}
            aria-label="Imagen siguiente"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all hover:bg-white active:scale-95"
            style={{ zIndex: 3 }}
          >
            <CaretRight size={18} weight="bold" style={{ color: 'var(--color-text-primary)' }} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2" style={{ zIndex: 3 }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Ir a imagen ${i + 1}`}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: i === idx ? 'white' : 'rgba(255,255,255,0.5)',
                  transform: i === idx ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
