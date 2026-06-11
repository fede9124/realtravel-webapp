'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ComponentProps, MouseEvent } from 'react'

/**
 * Link que envuelve la navegación de App Router en una View Transition.
 * Los elementos con `view-transition-name` compartido entre páginas morfean.
 *
 * Degradación: sin soporte del navegador (Firefox), con prefers-reduced-motion,
 * o con teclas modificadoras (cmd+click, etc.), navega como un Link normal.
 */
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

    document.startViewTransition(async () => {
      router.push(url)
      // App Router pinta de forma asíncrona: esperamos dos frames tras un tick
      // para que el snapshot "new" capture la página ya renderizada (las rutas
      // llegan prefetched por el Link, así que el pintado es casi inmediato).
      await new Promise<void>(resolve => {
        setTimeout(() => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        }, 120)
      })
    })
  }

  return <Link href={href} {...rest} onClick={handleClick} />
}
