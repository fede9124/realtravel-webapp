'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ComponentProps, MouseEvent } from 'react'

export function TransitionLink({ href, onClick, ...rest }: ComponentProps<typeof Link>) {
  const router = useRouter()

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (
      e.defaultPrevented ||
      e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
      e.button !== 0
    ) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduceMotion) return

    e.preventDefault()
    const url = typeof href === 'string' ? href : String(href)

    // El callback resuelve de forma síncrona — App Router es asíncrono y cualquier
    // espera artificial puede superar el timeout del browser con páginas pesadas.
    // La transición captura el estado viejo → navega → captura el estado nuevo
    // en cuanto React re-renderiza; el resultado es un crossfade limpio.
    document.startViewTransition(() => {
      router.push(url)
    })
  }

  return <Link href={href} {...rest} onClick={handleClick} />
}
